
"use client"

interface WelcomeBannerProps {
  userName: string;
}

const WelcomeBanner = ({ userName }: WelcomeBannerProps) => {
  return (
    <div className="w-full bg-[#40C4D3]/10 rounded-lg p-6 mb-6">
      <h1 className="text-2xl font-bold mb-2">Welcome back, {userName}!</h1>
      <p className="text-muted-foreground">
        Continue your job search journey and track your progress.
      </p>
    </div>
  );
};

export default WelcomeBanner;
