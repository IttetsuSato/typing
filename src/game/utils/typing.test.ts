import exp from "constants";
import { checkTyping } from "./typing"; // 実際のファイルパスに置き換えてください

describe("checkTyping", () => {
  test("正しいキーを順番に入力した場合、missがfalseでfinishedがtrueになる", () => {
    const targetWord = "りんご";
    let keyHistory: string[] = [];

    // 最初の入力 (r)
    let result = checkTyping(targetWord, "r", keyHistory);
    expect(result.miss).toBe(false);
    expect(result.finished).toBe(false);
    expect(result.keyHistory).toEqual(["r"]);

    // 2回目の入力 (i)
    result = checkTyping(targetWord, "i", result.keyHistory);
    expect(result.miss).toBe(false);
    expect(result.finished).toBe(false);
    expect(result.keyHistory).toEqual(["r", "i"]);

    // 3回目の入力 (n)
    result = checkTyping(targetWord, "n", result.keyHistory);
    expect(result.miss).toBe(false);
    expect(result.finished).toBe(false);
    expect(result.keyHistory).toEqual(["r", "i", "n"]);

    // 4回目の入力 (g)
    result = checkTyping(targetWord, "g", result.keyHistory);
    expect(result.miss).toBe(false);
    expect(result.finished).toBe(false);
    expect(result.keyHistory).toEqual(["r", "i", "n", "g"]);

    // 5回目の入力 (o)
    result = checkTyping(targetWord, "o", result.keyHistory);
    expect(result.miss).toBe(false);
    expect(result.finished).toBe(true);
    expect(result.keyHistory).toEqual(["r", "i", "n", "g", "o"]);
  });

  test("間違ったキーを入力した場合、missがtrueになる", () => {
    const targetWord = "りんご";
    let keyHistory: string[] = [];

    // 最初の入力 (r) は正しい
    let result = checkTyping(targetWord, "r", keyHistory);
    expect(result.miss).toBe(false);
    expect(result.finished).toBe(false);
    expect(result.keyHistory).toEqual(["r"]);

    // 2回目の入力 (x) は間違い
    result = checkTyping(targetWord, "x", result.keyHistory);
    expect(result.miss).toBe(true);
    expect(result.finished).toBe(false);
    expect(result.keyHistory).toEqual(["r"]);
  });

  test("複数のローマ字入力パターンに対応する", () => {
    const targetWord = "し";
    let keyHistory: string[] = [];

    // shiのパターン
    let result = checkTyping(targetWord, "s", keyHistory);
    expect(result.miss).toBe(false);
    expect(result.finished).toBe(false);
    result = checkTyping(targetWord, "h", result.keyHistory);
    expect(result.miss).toBe(false);
    expect(result.finished).toBe(false);
    result = checkTyping(targetWord, "i", result.keyHistory);
    expect(result.miss).toBe(false);
    expect(result.finished).toBe(true);

    // siのパターン
    keyHistory = [];
    result = checkTyping(targetWord, "s", keyHistory);
    expect(result.miss).toBe(false);
    expect(result.finished).toBe(false);
    result = checkTyping(targetWord, "i", result.keyHistory);
    expect(result.miss).toBe(false);
    expect(result.finished).toBe(true);
  });

  test("んのnが正しく判定される", () => {
    const targetWord = "ん";
    let keyHistory: string[] = [];

    // nを入力 (一回のnで「ん」と判定する)
    let result = checkTyping(targetWord, "n", keyHistory);
    expect(result.miss).toBe(false);
    expect(result.finished).toBe(true);
    expect(result.keyHistory).toEqual(["n"]);

    // nnを入力 (2回のnで「ん」と判定する)
    result = checkTyping(targetWord, "n", result.keyHistory);
    expect(result.miss).toBe(false);
    expect(result.finished).toBe(true);
    expect(result.keyHistory).toEqual(["n", "n"]);
  });
});
