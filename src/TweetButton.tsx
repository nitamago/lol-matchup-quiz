import { useTranslation } from "react-i18next";

type TweetButtonProps = {
  role: string;
  mainChampion: string;
  score: string;
  gameUrl?: string; // ゲームのリンクがあれば
};

export default function TweetButton({ role, mainChampion, score, gameUrl }: TweetButtonProps) {
  const { t } = useTranslation();
  const handleTweet = () => {
    if (mainChampion === "") {
        mainChampion = t("no");
    }
    const text = t("tweet.text1")+`: ${role}`+t("tweet.text2")+`: ${mainChampion}`+t("tweet.text3")+`${score}`+t("tweet.text4");
    const url = gameUrl ? `&url=${encodeURIComponent(gameUrl)}` : '';
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}${url}`;

    window.open(twitterUrl, '_blank');
  };

  return (
    <button
      onClick={handleTweet}
      className="bg-blue-500 text-white px-4 py-2 rounded"
    >
       {t("tweet.share")}
    </button>
  );
}
