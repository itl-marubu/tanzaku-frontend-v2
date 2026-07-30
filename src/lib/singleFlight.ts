// 同時実行を1本に制限する小さなゲート。
//
// /tree のポーリングは「前回の取得がまだ終わっていなければこの回を見送る」
// 必要がある。無条件に60秒ごとfetchを開始すると、レイテンシが間隔を超え
// 続けたときに応答が常に「最新ではない」判定になって全て破棄され、壁面が
// 二度と更新されなくなる（しかも復帰の契機がない）ため。

/** 実行できたら true、実行中で見送ったら false を返す */
export type SingleFlight = (task: () => Promise<void>) => Promise<boolean>;

// task の例外はそのまま呼び出し元へ伝播する（ゲートの解放は行う）。
// 呼び出し側で fire-and-forget する場合は task 内で捕捉しておくこと。
export function createSingleFlight(): SingleFlight {
  let running = false;

  return async (task) => {
    if (running) return false;

    running = true;
    try {
      await task();
    } finally {
      running = false;
    }
    return true;
  };
}
