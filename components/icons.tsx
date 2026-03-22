import {
  ArrowClockwise,
  ArrowCounterClockwise,
  BookmarkSimple,
  BookOpenText,
  CaretLeft,
  CaretRight,
  CaretDown,
  CaretUp,
  ChatCircle,
  CheckCircle,
  CircleNotch,
  ClockCounterClockwise,
  CreditCard,
  Crown,
  GoogleLogo,
  HandsPraying,
  Headphones,
  HighlighterCircle as HighlighterCircleIcon,
  Image,
  Info,
  Lock,
  MagnifyingGlass,
  MoonStars,
  Notebook,
  Pause,
  PersonSimpleHike,
  Play,
  PlayCircle,
  Plus,
  SignOut,
  SidebarSimple,
  SkipBack,
  SkipForward,
  Sparkle,
  SpeakerHigh,
  SpeakerSlash,
  SunDim,
  Trash,
  UserCircle,
  Video,
  WarningCircle,
  Waveform,
  X,
} from "@phosphor-icons/react/ssr";
import type { Icon, IconProps } from "@phosphor-icons/react/lib";

export type LucideIcon = Icon;

export type { IconProps };

export const AlertCircle = WarningCircle;
export const AudioLines = Waveform;
export const Bookmark = BookmarkSimple;
export const CheckCircle2 = CheckCircle;
export const ChevronLeft = CaretLeft;
export const ChevronRight = CaretRight;
export const ChevronDown = CaretDown;
export const ChevronUp = CaretUp;
export const Clock3 = ClockCounterClockwise;
export const HighlighterCircle = HighlighterCircleIcon;
export const Loader2 = CircleNotch;
export const LoaderCircle = CircleNotch;
export const LogOut = SignOut;
export const MessageCircle = ChatCircle;
export const MessageCircleHeart = ChatCircle;
export const MoonStar = MoonStars;
export const NotebookIcon = Notebook;
export const RefreshCw = ArrowClockwise;
export const RotateCcw = ArrowCounterClockwise;
export const RotateCw = ArrowClockwise;
export const Search = MagnifyingGlass;
export const Sparkles = Sparkle;
export const SunMedium = SunDim;
export const Trash2 = Trash;
export const UserRound = UserCircle;
export const UsersRound = UserCircle;
export const Volume2 = SpeakerHigh;
export const VolumeX = SpeakerSlash;

export function PanelLeftOpen(props: IconProps) {
  return <SidebarSimple {...props} />;
}

export function PanelLeftClose(props: IconProps) {
  return <SidebarSimple mirrored {...props} />;
}

export {
  BookOpenText,
  CreditCard,
  Crown,
  GoogleLogo,
  HandsPraying,
  Headphones,
  Image,
  Info,
  Lock,
  Pause,
  PersonSimpleHike,
  Play,
  PlayCircle,
  Plus,
  SkipBack,
  SkipForward,
  Video,
  X,
};
