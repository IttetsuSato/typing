import { romajiMap } from "@/const/romaji";

export const checkTyping = (
  targetWord: string, // 問題の単語
  typedKey: string, // ユーザーが入力したキー
  keyHistory: string[], // これまでの入力履歴
) => {
  // 入力された文字数に基づく現在の位置
  const currentIndex = keyHistory.join("").length;

  // targetWord の範囲外であれば終了
  if (currentIndex >= targetWord.length) {
    return {
      miss: true,
      finished: true,
      keyHistory,
    };
  }

  const currentChar = targetWord[currentIndex];
  const possibleRomaji = romajiMap[currentChar] || [currentChar]; // ひらがなかチェック
  const currentTyped = keyHistory.join(""); // 現在の履歴を文字列に変換

  let matchFound = false;

  // 各ローマ字パターンに対してチェックを行う
  for (const romaji of possibleRomaji) {
    // 現在の入力履歴＋今回の入力キーが、ローマ字パターンの先頭に一致するか
    const combinedTyped = currentTyped + typedKey;
    if (romaji.startsWith(combinedTyped)) {
      matchFound = true;
      keyHistory.push(typedKey); // 入力されたキーを履歴に追加

      // もし入力が完全に一致していれば、finishedをtrueにして返す
      if (combinedTyped === romaji) {
        return {
          miss: false,
          finished: true,
          keyHistory,
        };
      }

      // 部分的に一致している場合はfinishedをfalseにして返す
      return {
        miss: false,
        finished: false,
        keyHistory,
      };
    }
  }

  // 一致するパターンが見つからなかった場合はミス
  return {
    miss: true,
    finished: false,
    keyHistory,
  };
};
