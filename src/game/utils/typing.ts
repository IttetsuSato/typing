import { romajiMap } from "@/const/romaji";

type TypingResult = {
  miss: boolean;
  finished: boolean;
  keyHistory: string[];
};

// タイピング判定関数
export const checkTyping = (
  targetWord: string, // タイピング対象の文字列
  typedKey: string, // タイプされたキー
  keyHistory: string[], // 正しいキーの履歴
): TypingResult => {
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

  // これまでの履歴から現在のローマ字の候補を取得
  const currentTyped = keyHistory.join("");
  const remainingTyped = typedKey;

  for (const romaji of possibleRomaji) {
    if (romaji.startsWith(currentTyped + remainingTyped)) {
      // 正しいローマ字パターンの一部が入力された場合
      keyHistory.push(typedKey);

      // 完成したかどうかをチェック
      if (keyHistory.join("").length === targetWord.length) {
        return {
          miss: false,
          finished: true,
          keyHistory,
        };
      }

      return {
        miss: false,
        finished: false,
        keyHistory,
      };
    }
  }

  // 間違ったキーが入力された場合
  return {
    miss: true,
    finished: false,
    keyHistory,
  };
};
