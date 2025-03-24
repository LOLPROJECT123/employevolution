
import { Zap as LucideZap } from "lucide-react";

interface ZapProps extends React.ComponentProps<typeof LucideZap> {}

const Zap = (props: ZapProps) => {
  return <LucideZap {...props} />;
};

export default Zap;
export { Zap };
