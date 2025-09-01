type TweetButtonProps = {
  role: string;
  mainChampion: string;
  score: string;
  gameUrl?: string; // ゲームのリンクがあれば
};

export default function TweetButton({ role, mainChampion, score, gameUrl }: TweetButtonProps) {
  const handleTweet = () => {
    if (mainChampion === "") {
        mainChampion = "なし";
    }
    const text = `マッチアップクイズ\nロール: ${role}\nメインチャンプ: ${mainChampion}\nスコアは ${score} でした！\n`;
    const url = gameUrl ? `&url=${encodeURIComponent(gameUrl)}` : '';
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}${url}`;

    window.open(twitterUrl, '_blank');
  };

  return (
    <button
      onClick={handleTweet}
      className="bg-blue-500 text-white px-4 py-2 rounded"
    >
      Twitterに投稿
    </button>
  );
}
