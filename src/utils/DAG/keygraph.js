import { char_keys_table } from "./char_keys_table";

/*
読み込み
<script src="keygraph.js"></script>

タイプする文字の初期化
文字はひらがなと一部のカタカナ、半角文字等、詳細は、char_keys_table 変数で定義されている str 変数を参照のこと。
keygraph.build("ひっしゅう");

これからタイプするキーの取得、キーの複数候補がある場合は、そのうち1つを得ることができる。
keygraph.key_candidate();

タイプしおわったキーの取得
keygraph.key_done();

これから打つ ひらがな の取得
keygraph.seq_candidates();

打ち終わった ひらがな の取得
keygraph.seq_done();

入力キーのチェック、addEventListener("keydown",e=>{}) でキーイベント e を取得した場合の例
if( keygraph.next(e.key) ){
    // 正解の場合
    if( keygraph.is_finished() ){
        // すべてのキーが入力された場合
    }
}else {
    // 不正解の場合
}
*/
export const keygraph = {
    // キーチェインの作成、初期化
    build: function (seq) {
        // タイプする文字列の保存、入力補完の初期化
        this._seq = seq;
        // this._autocomplete_registered = [];

        // ヘッダー、フッターのチェインを作成する。
        this._chain_head = Object.create(this._chain_proto);
        this._chain_head._seq_ptr = 0;
        this._chain_head._key = "HEAD";
        this._chain_head._node_id = 0;
        this._chains = [this._chain_head];

        const merge_parents = (parents) => {
            const node_equals = (p0, p1) => {
                const to_string = p => p._children?.map(e => e._node_id).sort().join(" ");
                return p0._key === p1._key && to_string(p0) == to_string(p1);
            }
            const replaced_parents = [];
            parents.map((parent) => [parent, []]).
                filter(([parent1, replaced]) => {
                    // ノードが表すキーと子ノード一覧が同じノードを取得する。
                    replaced.push(parents.find(parent0 => node_equals(parent0, parent1)));
                    // 取得した親ノードが検索しているノードと違う場合はマージ対象となる。
                    return replaced[0] !== parent1;
                }).forEach(([parent, replaced_parent]) => {
                    // 削除されたことを表す _merged をセットする。これはデバッグ用に使用する。
                    parent._merged = true;
                    parent._children?.forEach(sibling => { sibling._parents.splice(sibling._parents.indexOf(parent), 1); });
                    parent._parents?.forEach(granpa => {
                        granpa._children.splice(granpa._children.indexOf(parent), 1);
                        granpa._children.includes(replaced_parent[0]) || (() => { granpa._children.push(replaced_parent[0]); granpa._children.sort((e0, e1) => e0._node_id - e1._node_id) })();
                        replaced_parent[0]._parents.includes(granpa) || replaced_parent[0]._parents.push(granpa);
                    });
                    replaced_parents.includes(replaced_parent[0]) || replaced_parents.push(replaced_parent[0]);
                });

            // 残った親は、その親がマージできる可能性があるので繰り返す。
            replaced_parents.filter(e => e._parents !== undefined).forEach(e => {
                merge_parents(e._parents/*.sort((e0,e1)=>e0._node_id-e1._node_id)*/);
            });
        };
        // 親ノード parent に key(ex: "wwha") の1文字ずつをノードとして追加する。
        const add_chains = (parent, key) => {
            let ch = parent;
            Array.from(key).forEach(k => {
                ch = ch.find_child(k) ?? Object.create(this._chain_proto).set(k, ch).store(this._chains);
            });
            return ch;
        };

        const open = [{ p: 0, parents: [this._chain_head] }];
        let n = undefined;
        while ((() => { n = open.shift(); return n; })() !== undefined) {
            merge_parents(n.parents);
            const parents = n.parents.filter(e => e._merged === undefined);
            char_keys_table.filter(ckeys => this._seq.substring(n.p).startsWith(ckeys.char))/*.sort((e0, e1) => e0.char.length - e1.char.length)*/.forEach(ckeys => {
                const keys = typeof (ckeys.keys) === "function" ? ckeys.keys.bind(this)(this._seq.substring(n.p)) : ckeys.keys;
                const p1 = n.p + ckeys.char.length;
                const ch_es = [];
                // "っし" sshi のように2文字は優先的に keygraph.key_candidatesで選ばれるこれからタイプするキーパターンの代表に選ばれやすいように
                // _childrenの先頭に追加する。ただし、ノードマージで_childrenの順序は変わるので、必ず選ばれるというわけではない。
                const older = false;//ckeys.char.length === 2;
                (older ? [...keys].reverse() : keys).forEach(key => {
                    parents.forEach(parent => {
                        ch_es.push(add_chains(parent, key, older));
                        ch_es.slice(-1)[0].set_seq_ptr(p1);
                    });
                });
                // openに次の処理を追加
                const m = open.find(e => e.p === p1) ?? (() => { const m = { p: p1, parents: [] }; open.push(m); return m; })();
                m.parents.push(...ch_es);
            });
            // char_keys_tableから該当する要素を抽出したあとで char の文字数の昇順でソートして上の処理をすれば子のソート処理は必要ない。
            // key_candidateで複数のキーパターンから1つが選ばれる基準が char_keys_table の要素順になるためには、ここでソート処理をして、char_keys_tableから要素を抽出して
            // 処理をする場合は何もソートをしないようにする。
            open.sort((e0, e1) => e0.p - e1.p);
        }

        // 現在のタイプ位置のセット
        this._chain_cur = this._chain_head;
        this._seq_ptr_cur = 0;
        this._key_done = "";
        return this._seq;
    },
    // キーチェック、正解した場合 true を返す。そのときは内部で保持する文字の現在位置も1つ先に進む。
    next: function (key) {
        key = this._input_key_maps[key] ?? key;

        // 入力自動補完の実行
        this._autocomplete_fired.forEach(a => a.key?.(key, this.next.bind(this)));

        const nx = this._chain_cur?.find_child(key);
        if (nx === undefined) {
            return false;
        }
        this._chain_cur = nx;
        this._key_done += key;
        const seq_ptr_cur0 = this._seq_ptr_cur;
        this._seq_ptr_cur = nx._seq_ptr ?? this._seq_ptr_cur;

        if (seq_ptr_cur0 !== this._seq_ptr_cur) {
            // 日本語の文字が先に進んだ場合
            this._autocomplete_fired = [];
            this._autocomplete_registered.forEach(a => {
                if (this._seq.substring(this._seq_ptr_cur + (a.seq_ptr_d ?? 0)).match(a.seq_pattern)) {
                    a.fired?.(key, this.next.bind(this));
                    if (a.key !== undefined) {
                        this._autocomplete_fired.push(a);
                    }
                }
            });
        }
        return true;
    },
    // 初期状態に戻す。
    reset: function () {
        this._seq = undefined;
        this._seq_ptr_cur = 0;
        this._chain_head = undefined;
        this._chain_cur = undefined;
        this._chains = undefined;
        this._key_done = "";
        this._autocomplete_fired = [];
        this._autocomplete_registered = [];
    },
    // 入力自動補完の登録
    register_autocomplete: function (autocomplete) {
        this._autocomplete_registered.push(autocomplete);
    },
    // 現在実施中の自動入力補完
    _autocomplete_fired: [],
    // 登録している自動入力補完
    _autocomplete_registered: [],
    // 自動入力設定用のデータフォーマット(メモ用で実際にはここからオブジェクトを作成していない)
    _autocomplete_proto: {
        // 入力補完が発動する文字の正規表現
        seq_pattern: undefined,
        // 発動したときに実行されるメソッド
        fired: undefined,
        // 発動後にキー入力があったときに実行されるメソッド
        key: undefined,
    },

    // すべての文字を打ち終わったかの判定
    is_finished: function () {
        return this._seq_ptr_cur === this._seq?.length;
    },
    // これまでに正解として打ったキーの履歴
    key_done: function () {
        return this._key_done;
    },
    // これから打たなければいけないキーの一例
    key_candidate: function () {
        let ch = this._chain_cur?._children?.[0];
        let str = "";
        while (ch !== undefined) {
            // キー候補のうち配列の最初の文字のみを使用する。
            str += ch._key;
            ch = ch._children?.[0];
        }
        return str;
    },
    // これまでに正解として打った日本語の履歴
    seq_done: function () {
        return this._seq?.substring(0, this._seq_ptr_cur);
    },
    // これから打つ日本語の文字列
    seq_candidates: function () {
        return this._seq?.substring(this._seq_ptr_cur);
    },

    // キーチェインの1つのノードを表す。
    // キーチェインは有向非循環グラフ(DAG)となる。
    _chain_proto: {
        find_child: function (k) {
            return this._children?.filter(ch => ch._key === k)[0];
        },
        // このノードが表すキー(ex: a)、親ノードを設定する。
        set: function (k, ch0, older) {
            // _node_idはキーチェインノードの識別子
            this._node_id = this._create_node_id();
            this._key = k;
            this._parents = [ch0];
            ch0._children ??= [];
            older ? ch0._children.unshift(this) : ch0._children.push(this);
            // ch0._children.push(this);
            return this;
        },
        store: function (storage) {
            storage.push(this);
            return this;
        },
        set_seq_ptr: function (seq_ptr) {
            this._seq_ptr = seq_ptr;
            return this;
        },
        get_seq_ptr: function () {
            return this._seq_ptr;
        },
        // この関数を呼び出すたびに、1つインクリメントされた数値を返す。
        // Object.createでprototypeを本オブジェクトに指定しても
        // プロトタイプの関数なので実体は1つとなり、どのオブジェクトから
        // 呼び出しても同じ関数が呼び出される。よって番号は1つずつ上がる。
        _create_node_id: (function () {
            let id = 0;
            return function () {
                id += 1;
                return id;
            };
        })(),
        // 子ノード一覧
        _children: undefined,
        // 親ノード一覧(ノードをマージするときのみ使用する)
        _parents: undefined,
        // このノードが表すキー1文字(例: a)
        _key: undefined,
        // このノードが日本語の文字の完了キーになっている場合、
        // キーグラフが表す日本語の文字番号（先頭文字を1とした通し番号）をセットする。
        _seq_ptr: undefined,
        // ノード番号、キーグラフのスタート地点のHEADを0として生成された順に番号が付けられる。
        _node_id: undefined,
        // マージされたノードは、この変数に true がセットされる。
        _merged: undefined,
    },

    // 入力文字シーケンス
    _seq: undefined,
    // 文字のカーソル位置
    _seq_ptr_cur: 0,
    // キーチェインのヘッダー（_chain_curのみあれば十分で処理として使わない予定だけど念のための保管しておく）
    _chain_head: undefined,
    // キーチェイン上の現在位置
    _chain_cur: undefined,
    // すべてのキーチェインを保存する。キーチェインを作成した後で冗長部分をマージするために使用する。
    _chains: undefined,

    // これまでに正解として打ったキーの履歴
    _key_done: "",

    // keydownイベントのkey変数の特殊文字をコードに変換する。
    // keyCodeを使うと改行が\rになったり、String.fromCharCodeで文字化したときに
    // 大文字になったりするので使っていない。
    _input_key_maps: {
        Enter: "\n",
        Tab: "\t",
    },

    
}
