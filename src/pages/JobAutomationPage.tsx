import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Check,
  Copy,
  ExternalLink,
  FileText,
  Plus,
  Save,
  Trash,
  Upload,
  User,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { Button as ShadButton } from "@/components/ui/button";
import { Input as ShadInput } from "@/components/ui/input";
import { Popover as ShadPopover, PopoverClose, PopoverContent as ShadPopoverContent, PopoverTrigger as ShadPopoverTrigger } from "@/components/ui/popover"
import { Label as ShadLabel } from "@/components/ui/label"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { ResumeSkillsExtractor } from "@/utils/jobMatching/ResumeSkillsExtractor";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress as ShadProgress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch as ShadSwitch } from "@/components/ui/switch"
import { Textarea as ShadTextarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Drawer as ShadDrawer,
  DrawerClose as ShadDrawerClose,
  DrawerContent as ShadDrawerContent,
  DrawerDescription as ShadDrawerDescription,
  DrawerFooter as ShadDrawerFooter,
  DrawerHeader as ShadDrawerHeader,
  DrawerTitle as ShadDrawerTitle,
  DrawerTrigger as ShadDrawerTrigger,
} from "@/components/ui/drawer"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  HoverCard,
  HoverCardContent,
  HoverCardDescription,
  HoverCardHeader,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
  Command as ShadCommand,
  CommandDialog as ShadCommandDialog,
  CommandEmpty as ShadCommandEmpty,
  CommandGroup as ShadCommandGroup,
  CommandInput as ShadCommandInput,
  CommandItem as ShadCommandItem,
  CommandList as ShadCommandList,
  CommandSeparator as ShadCommandSeparator,
  CommandShortcut as ShadCommandShortcut,
} from "@/components/ui/command"
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  Dialog as ShadDialog,
  DialogClose,
  DialogContent as ShadDialogContent,
  DialogDescription as ShadDialogDescription,
  DialogFooter as ShadDialogFooter,
  DialogHeader as ShadDialogHeader,
  DialogTitle as ShadDialogTitle,
  DialogTrigger as ShadDialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu as ShadDropdownMenu,
  DropdownMenuCheckboxItem as ShadDropdownMenuCheckboxItem,
  DropdownMenuContent as ShadDropdownMenuContent,
  DropdownMenuItem as ShadDropdownMenuItem,
  DropdownMenuLabel as ShadDropdownMenuLabel,
  DropdownMenuSeparator as ShadDropdownMenuSeparator,
  DropdownMenuShortcut as ShadDropdownMenuShortcut,
  DropdownMenuTrigger as ShadDropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Form as ShadForm,
  FormControl as ShadFormControl,
  FormDescription as ShadFormDescription,
  FormField as ShadFormField,
  FormItem as ShadFormItem,
  FormLabel as ShadFormLabel,
  FormMessage as ShadFormMessage,
} from "@/components/ui/form"
import {
  Input as ShadInput,
} from "@/components/ui/input"
import {
  Label as ShadLabel,
} from "@/components/ui/label"
import {
  Select as ShadSelect,
  SelectContent as ShadSelectContent,
  SelectItem as ShadSelectItem,
  SelectTrigger as ShadSelectTrigger,
  SelectValue as ShadSelectValue,
} from "@/components/ui/select"
import {
  Separator as ShadSeparator,
} from "@/components/ui/separator"
import {
  Slider as ShadSlider,
} from "@/components/ui/slider"
import {
  Switch as ShadSwitch,
} from "@/components/ui/switch"
import {
  Table as ShadTable,
  TableBody as ShadTableBody,
  TableCaption as ShadTableCaption,
  TableCell as ShadTableCell,
  TableHead as ShadTableHead,
  TableRow as ShadTableRow,
} from "@/components/ui/table"
import {
  Textarea as ShadTextarea,
} from "@/components/ui/textarea"
import {
  Tooltip as ShadTooltip,
  TooltipContent as ShadTooltipContent,
  TooltipProvider as ShadTooltipProvider,
  TooltipTrigger as ShadTooltipTrigger,
} from "@/components/ui/tooltip"
import {
  useFormField,
} from "@/components/ui/form"
import {
  Accordion as ShadAccordion,
  AccordionContent as ShadAccordionContent,
  AccordionItem as ShadAccordionItem,
  AccordionTrigger as ShadAccordionTrigger,
} from "@/components/ui/accordion"
import {
  AlertDialog as ShadAlertDialog,
  AlertDialogAction as ShadAlertDialogAction,
  AlertDialogCancel as ShadAlertDialogCancel,
  AlertDialogContent as ShadAlertDialogContent,
  AlertDialogDescription as ShadAlertDialogDescription,
  AlertDialogFooter as ShadAlertDialogFooter,
  AlertDialogHeader as ShadAlertDialogHeader,
  AlertDialogTitle as ShadAlertDialogTitle,
  AlertDialogTrigger as ShadAlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Avatar as ShadAvatar,
  AvatarFallback as ShadAvatarFallback,
  AvatarImage as ShadAvatarImage,
} from "@/components/ui/avatar"
import {
  Badge as ShadBadge,
} from "@/components/ui/badge"
import {
  Button as ShadButton,
} from "@/components/ui/button"
import {
  Calendar as ShadCalendar,
} from "@/components/ui/calendar"
import {
  Card as ShadCard,
  CardContent as ShadCardContent,
  CardDescription as ShadCardDescription,
  CardFooter as ShadCardFooter,
  CardHeader as ShadCardHeader,
  CardTitle as ShadCardTitle,
} from "@/components/ui/card"
import {
  Checkbox as ShadCheckbox,
} from "@/components/ui/checkbox"
import {
  Command as ShadCommand,
  CommandDialog as ShadCommandDialog,
  CommandEmpty as ShadCommandEmpty,
  CommandGroup as ShadCommandGroup,
  CommandInput as ShadCommandInput,
  CommandItem as ShadCommandItem,
  CommandList as ShadCommandList,
  CommandSeparator as ShadCommandSeparator,
  CommandShortcut as ShadCommandShortcut,
} from "@/components/ui/command"
import {
  ContextMenu as ShadContextMenu,
  ContextMenuCheckboxItem as ShadContextMenuCheckboxItem,
  ContextMenuContent as ShadContextMenuContent,
  ContextMenuItem as ShadContextMenuItem,
  ContextMenuLabel as ShadContextMenuLabel,
  ContextMenuRadioGroup as ShadContextMenuRadioGroup,
  ContextMenuRadioItem as ShadContextMenuRadioItem,
  ContextMenuSeparator as ShadContextMenuSeparator,
  ContextMenuSub as ShadContextMenuSub,
  ContextMenuSubContent as ShadContextMenuSubContent,
  ContextMenuSubTrigger as ShadContextMenuSubTrigger,
  ContextMenuTrigger as ShadContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  Dialog as ShadDialog,
  DialogClose as ShadDialogClose,
  DialogContent as ShadDialogContent,
  DialogDescription as ShadDialogDescription,
  DialogFooter as ShadDialogFooter,
  DialogHeader as ShadDialogHeader,
  DialogTitle as ShadDialogTitle,
  DialogTrigger as ShadDialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer as ShadDrawer,
  DrawerClose as ShadDrawerClose,
  DrawerContent as ShadDrawerContent,
  DrawerDescription as ShadDrawerDescription,
  DrawerFooter as ShadDrawerFooter,
  DrawerHeader as ShadDrawerHeader,
  DrawerTitle as ShadDrawerTitle,
  DrawerTrigger as ShadDrawerTrigger,
} from "@/components/ui/drawer"
import {
  DropdownMenu as ShadDropdownMenu,
  DropdownMenuCheckboxItem as ShadDropdownMenuCheckboxItem,
  DropdownMenuContent as ShadDropdownMenuContent,
  DropdownMenuItem as ShadDropdownMenuItem,
  DropdownMenuLabel as ShadDropdownMenuLabel,
  DropdownMenuSeparator as ShadDropdownMenuSeparator,
  DropdownMenuShortcut as ShadDropdownMenuShortcut,
  DropdownMenuTrigger as ShadDropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Form as ShadForm,
  FormControl as ShadFormControl,
  FormDescription as ShadFormDescription,
  FormField as ShadFormField,
  FormItem as ShadFormItem,
  FormLabel as ShadFormLabel,
  FormMessage as ShadFormMessage,
} from "@/components/ui/form"
import {
  HoverCard as ShadHoverCard,
  HoverCardContent as ShadHoverCardContent,
  HoverCardDescription as ShadHoverCardDescription,
  HoverCardHeader as ShadHoverCardHeader,
  HoverCardTrigger as ShadHoverCardTrigger,
} from "@/components/ui/hover-card"
import {
  Input as ShadInput,
} from "@/components/ui/input"
import {
  Label as ShadLabel,
} from "@/components/ui/label"
import {
  Popover as ShadPopover,
  PopoverClose as ShadPopoverClose,
  PopoverContent as ShadPopoverContent,
  PopoverTrigger as ShadPopoverTrigger,
} from "@/components/ui/popover"
import {
  Progress as ShadProgress,
} from "@/components/ui/progress"
import {
  ResizableHandle as ShadResizableHandle,
  ResizablePanel as ShadResizablePanel,
  ResizablePanelGroup as ShadResizablePanelGroup,
} from "@/components/ui/resizable"
import {
  ScrollArea as ShadScrollArea,
} from "@/components/ui/scroll-area"
import {
  Select as ShadSelect,
  SelectContent as ShadSelectContent,
  SelectItem as ShadSelectItem,
  SelectTrigger as ShadSelectTrigger,
  SelectValue as ShadSelectValue,
} from "@/components/ui/select"
import {
  Separator as ShadSeparator,
} from "@/components/ui/separator"
import {
  Skeleton as ShadSkeleton,
} from "@/components/ui/skeleton"
import {
  Slider as ShadSlider,
} from "@/components/ui/slider"
import {
  Switch as ShadSwitch,
} from "@/components/ui/switch"
import {
  Table as ShadTable,
  TableBody as ShadTableBody,
  TableCaption as ShadTableCaption,
  TableCell as ShadTableCell,
  TableHead as ShadTableHead,
  TableRow as ShadTableRow,
} from "@/components/ui/table"
import {
  Textarea as ShadTextarea,
} from "@/components/ui/textarea"
import {
  Tooltip as ShadTooltip,
  TooltipContent as ShadTooltipContent,
  TooltipProvider as ShadTooltipProvider,
  TooltipTrigger as ShadTooltipTrigger,
} from "@/components/ui/tooltip"
import {
  useFormField as ShaduseFormField,
} from "@/components/ui/form"
import {
  useForm as ShaduseForm,
} from "react-hook-form"
import {
  zodResolver as ShadzodResolver,
} from "@hookform/resolvers/zod"
import {
  Form as ShadForm,
  FormControl as ShadFormControl,
  FormDescription as ShadFormDescription,
  FormField as ShadFormField,
  FormItem as ShadFormItem,
  FormLabel as ShadFormLabel,
  FormMessage as ShadFormMessage,
} from "@/components/ui/form"
import {
  Input as ShadInput,
} from "@/components/ui/input"
import {
  Label as ShadLabel,
} from "@/components/ui/label"
import {
  Select as ShadSelect,
  SelectContent as ShadSelectContent,
  SelectItem as ShadSelectItem,
  SelectTrigger as ShadSelectTrigger,
  SelectValue as ShadSelectValue,
} from "@/components/ui/select"
import {
  Separator as ShadSeparator,
} from "@/components/ui/separator"
import {
  Slider as ShadSlider,
} from "@/components/ui/slider"
import {
  Switch as ShadSwitch,
} from "@/components/ui/switch"
import {
  Table as ShadTable,
  TableBody as ShadTableBody,
  TableCaption as ShadTableCaption,
  TableCell as ShadTableCell,
  TableHead as ShadTableHead,
  TableRow as ShadTableRow,
} from "@/components/ui/table"
import {
  Textarea as ShadTextarea,
} from "@/components/ui/textarea"
import {
  Tooltip as ShadTooltip,
  TooltipContent as ShadTooltipContent,
  TooltipProvider as ShadTooltipProvider,
  TooltipTrigger as ShadTooltipTrigger,
} from "@/components/ui/tooltip"
import {
  useFormField as ShaduseFormField,
} from "@/components/ui/form"
import {
  useForm as ShaduseForm,
} from "react-hook-form"
import {
  zodResolver as ShadzodResolver,
} from "@hookform/resolvers/zod"
import {
  Form as ShadForm,
  FormControl as ShadFormControl,
  FormDescription as ShadFormDescription,
  FormField as ShadFormField,
  FormItem as ShadFormItem,
  FormLabel as ShadFormLabel,
  FormMessage as ShadFormMessage,
} from "@/components/ui/form"
import {
  Input as ShadInput,
} from "@/components/ui/input"
import {
  Label as ShadLabel,
} from "@/components/ui/label"
import {
  Select as ShadSelect,
  SelectContent as ShadSelectContent,
  SelectItem as ShadSelectItem,
  SelectTrigger as ShadSelectTrigger,
  SelectValue as ShadSelectValue,
} from "@/components/ui/select"
import {
  Separator as ShadSeparator,
} from "@/components/ui/separator"
import {
  Slider as ShadSlider,
} from "@/components/ui/slider"
import {
  Switch as ShadSwitch,
} from "@/components/ui/switch"
import {
  Table as ShadTable,
  TableBody as ShadTableBody,
  TableCaption as ShadTableCaption,
  TableCell as ShadTableCell,
  TableHead as ShadTableHead,
  TableRow as ShadTableRow,
} from "@/components/ui/table"
import {
  Textarea as ShadTextarea,
} from "@/components/ui/textarea"
import {
  Tooltip as ShadTooltip,
  TooltipContent as ShadTooltipContent,
  TooltipProvider as ShadTooltipProvider,
  TooltipTrigger as ShadTooltipTrigger,
} from "@/components/ui/tooltip"
import {
  useFormField as ShaduseFormField,
} from "@/components/ui/form"
import {
  useForm as ShaduseForm,
} from "react-hook-form"
import {
  zodResolver as ShadzodResolver,
} from "@hookform/resolvers/zod"
import {
  Form as ShadForm,
  FormControl as ShadFormControl,
  FormDescription as ShadFormDescription,
  FormField as ShadFormField,
  FormItem as ShadFormItem,
  FormLabel as ShadFormLabel,
  FormMessage as ShadFormMessage,
} from "@/components/ui/form"
import {
  Input as ShadInput,
} from "@/components/ui/input"
import {
  Label as ShadLabel,
} from "@/components/ui/label"
import {
  Select as ShadSelect,
  SelectContent as ShadSelectContent,
  SelectItem as ShadSelectItem,
  SelectTrigger as ShadSelectTrigger,
  SelectValue as ShadSelectValue,
} from "@/components/ui/select"
import {
  Separator as ShadSeparator,
} from "@/components/ui/separator"
import {
  Slider as ShadSlider,
} from "@/components/ui/slider"
import {
  Switch as ShadSwitch,
} from "@/components/ui/switch"
import {
  Table as ShadTable,
  TableBody as ShadTableBody,
  TableCaption as ShadTableCaption,
  TableCell as ShadTableCell,
  TableHead as ShadTableHead,
  TableRow as ShadTableRow,
} from "@/components/ui/table"
import {
  Textarea as ShadTextarea,
} from "@/components/ui/textarea"
import {
  Tooltip as ShadTooltip,
  TooltipContent as ShadTooltipContent,
  TooltipProvider as ShadTooltipProvider,
  TooltipTrigger as ShadTooltipTrigger,
} from "@/components/ui/tooltip"
import {
  useFormField as ShaduseFormField,
} from "@/components/ui/form"
import {
  useForm as ShaduseForm,
} from "react-hook-form"
import {
  zodResolver as ShadzodResolver,
} from "@hookform/resolvers/zod"
import {
  Form as ShadForm,
  FormControl as ShadFormControl,
  FormDescription as ShadFormDescription,
  FormField as ShadFormField,
  FormItem as ShadFormItem,
  FormLabel as ShadFormLabel,
  FormMessage as ShadFormMessage,
} from "@/components/ui/form"
import {
  Input as ShadInput,
} from "@/components/ui/input"
import {
  Label as ShadLabel,
} from "@/components/ui/label"
import {
  Select as ShadSelect,
  SelectContent as ShadSelectContent,
  SelectItem as ShadSelectItem,
  SelectTrigger as ShadSelectTrigger,
  SelectValue as ShadSelectValue,
} from "@/components/ui/select"
import {
  Separator as ShadSeparator,
} from "@/components/ui/separator"
import {
  Slider as ShadSlider,
} from "@/components/ui/slider"
import {
  Switch as ShadSwitch,
} from "@/components/ui/switch"
import {
  Table as ShadTable,
  TableBody as ShadTableBody,
  TableCaption as ShadTableCaption,
  TableCell as ShadTableCell,
  TableHead as ShadTableHead,
  TableRow as ShadTableRow,
} from "@/components/ui/table"
import {
  Textarea as ShadTextarea,
} from "@/components/ui/textarea"
import {
  Tooltip as ShadTooltip,
  TooltipContent as ShadTooltipContent,
  TooltipProvider as ShadTooltipProvider,
  TooltipTrigger as ShadTooltipTrigger,
} from "@/components/ui/tooltip"
import {
  useFormField as ShaduseFormField,
} from "@/components/ui/form"
import {
  useForm as ShaduseForm,
} from "react-hook-form"
import {
  zodResolver as ShadzodResolver,
} from "@hookform/resolvers/zod"
import {
  Form as ShadForm,
  FormControl as ShadFormControl,
  FormDescription as ShadFormDescription,
  FormField as ShadFormField,
  FormItem as ShadFormItem,
  FormLabel as ShadFormLabel,
  FormMessage as ShadFormMessage,
} from "@/components/ui/form"
import {
  Input as ShadInput,
} from "@/components/ui/input"
import {
  Label as ShadLabel,
} from "@/components/ui/label"
import {
  Select as ShadSelect,
  SelectContent as ShadSelectContent,
  SelectItem as ShadSelectItem,
  SelectTrigger as ShadSelectTrigger,
  SelectValue as ShadSelectValue,
} from "@/components/ui/select"
import {
  Separator as ShadSeparator,
} from "@/components/ui/separator"
import {
  Slider as ShadSlider,
} from "@/components/ui/slider"
import {
  Switch as ShadSwitch,
} from "@/components/ui/switch"
import {
  Table as ShadTable,
  TableBody as ShadTableBody,
  TableCaption as ShadTableCaption,
  TableCell as ShadTableCell,
  TableHead as ShadTableHead,
  TableRow as ShadTableRow,
} from "@/components/ui/table"
import {
  Textarea as ShadTextarea,
} from "@/components/ui/textarea"
import {
  Tooltip as ShadTooltip,
  TooltipContent as ShadTooltipContent,
  TooltipProvider as ShadTooltipProvider,
  TooltipTrigger as ShadTooltipTrigger,
} from "@/components/ui/tooltip"
import {
  useFormField as ShaduseFormField,
} from "@/components/ui/form"
import {
  useForm as ShaduseForm,
} from "react-hook-form"
import {
  zodResolver as ShadzodResolver,
} from "@hookform/resolvers/zod"
import {
  Form as ShadForm,
  FormControl as ShadFormControl,
  FormDescription as ShadFormDescription,
  FormField as ShadFormField,
  FormItem as ShadFormItem,
  FormLabel as ShadFormLabel,
  FormMessage as ShadFormMessage,
} from "@/components/ui/form"
import {
  Input as ShadInput,
} from "@/components/ui/input"
import {
  Label as ShadLabel,
} from "@/components/ui/label"
import {
  Select as ShadSelect,
  SelectContent as ShadSelectContent,
  SelectItem as ShadSelectItem,
  SelectTrigger as ShadSelectTrigger,
  SelectValue as ShadSelectValue,
} from "@/components/ui/select"
import {
  Separator as ShadSeparator,
} from "@/components/ui/separator"
import {
  Slider as ShadSlider,
} from "@/components/ui/slider"
import {
  Switch as ShadSwitch,
} from "@/components/ui/switch"
import {
  Table as ShadTable,
  TableBody as ShadTableBody,
  TableCaption as ShadTableCaption,
  TableCell as ShadTableCell,
  TableHead as ShadTableHead,
  TableRow as ShadTableRow,
} from "@/components/ui/table"
import {
  Textarea as ShadTextarea,
} from "@/components/ui/textarea"
import {
  Tooltip as ShadTooltip,
  TooltipContent as ShadTooltipContent,
  TooltipProvider as ShadTooltipProvider,
  TooltipTrigger as ShadTooltipTrigger,
} from "@/components/ui/tooltip"
import {
  useFormField as ShaduseFormField,
} from "@/components/ui/form"
import {
  useForm as ShaduseForm,
} from "react-hook-form"
import {
  zodResolver as ShadzodResolver,
} from "@hookform/resolvers/zod"
import {
  Form as ShadForm,
  FormControl as ShadFormControl,
  FormDescription as ShadFormDescription,
  FormField as ShadFormField,
  FormItem as ShadFormItem,
  FormLabel as ShadFormLabel,
  FormMessage as ShadFormMessage,
} from "@/components/ui/form"
import {
  Input as ShadInput,
} from "@/components/ui/input"
import {
  Label as ShadLabel,
} from "@/components/ui/label"
import {
  Select as ShadSelect,
  SelectContent as ShadSelectContent,
  SelectItem as ShadSelectItem,
  SelectTrigger as ShadSelectTrigger,
  SelectValue as ShadSelectValue,
} from "@/components/ui/select"
import {
  Separator as ShadSeparator,
} from "@/components/ui/separator"
import {
  Slider as ShadSlider,
} from "@/components/ui/slider"
import {
  Switch as ShadSwitch,
} from "@/components/ui/switch"
import {
  Table as ShadTable,
  TableBody as ShadTableBody,
  TableCaption as ShadTableCaption,
  TableCell as ShadTableCell,
  TableHead as ShadTableHead,
  TableRow as ShadTableRow,
} from "@/components/ui/table"
import {
  Textarea as ShadTextarea,
} from "@/components/ui/textarea"
import {
  Tooltip as ShadTooltip,
  TooltipContent as ShadTooltipContent,
  TooltipProvider as ShadTooltipProvider,
  TooltipTrigger as ShadTooltipTrigger,
} from "@/components/ui/tooltip"
import {
  useFormField as ShaduseFormField,
} from "@/components/ui/form"
import {
  useForm as ShaduseForm,
} from "react-hook-form"
import {
  zodResolver as ShadzodResolver,
} from "@hookform/resolvers/zod"
import {
  Form as ShadForm,
  FormControl as ShadFormControl,
  FormDescription as ShadFormDescription,
  FormField as ShadFormField,
  FormItem as ShadFormItem,
  FormLabel as ShadFormLabel,
  FormMessage as ShadFormMessage,
} from "@/components/ui/form"
import {
  Input as ShadInput,
} from "@/components/ui/input"
import {
  Label as ShadLabel,
} from "@/components/ui/label"
import {
  Select as ShadSelect,
  SelectContent as ShadSelectContent,
  SelectItem as ShadSelectItem,
  SelectTrigger as ShadSelectTrigger,
  SelectValue as ShadSelectValue,
} from "@/components/ui/select"
import {
  Separator as ShadSeparator,
} from "@/components/ui/separator"
import {
  Slider as ShadSlider,
} from "@/components/ui/slider"
import {
  Switch as ShadSwitch,
} from "@/components/ui/switch"
import {
  Table as ShadTable,
  TableBody as ShadTableBody,
  TableCaption as ShadTableCaption,
  TableCell as ShadTableCell,
  TableHead as ShadTableHead,
  TableRow as ShadTableRow,
} from "@/components/ui/table"
import {
  Textarea as ShadTextarea,
} from "@/components/ui/textarea"
import {
  Tooltip as ShadTooltip,
  TooltipContent as ShadTooltipContent,
  TooltipProvider as ShadTooltipProvider,
  TooltipTrigger as ShadTooltipTrigger,
} from "@/components/ui/tooltip"
import {
  useFormField as ShaduseFormField,
} from "@/components/ui/form"
import {
  useForm as ShaduseForm,
} from "react-hook-form"
import {
  zodResolver as ShadzodResolver,
} from "@hookform/resolvers/zod"
import {
  Form as ShadForm,
  FormControl as ShadFormControl,
  FormDescription as ShadFormDescription,
  FormField as ShadFormField,
  FormItem as ShadFormItem,
  FormLabel as ShadFormLabel,
  FormMessage as ShadFormMessage,
} from "@/components/ui/form"
import {
  Input as ShadInput,
} from "@/components/ui/input"
import {
  Label as ShadLabel,
} from "@/components/ui/label"
import {
  Select as ShadSelect,
  SelectContent as ShadSelectContent,
  SelectItem as ShadSelectItem,
  SelectTrigger as ShadSelectTrigger,
  SelectValue as ShadSelectValue,
} from "@/components/ui/select"
import {
  Separator as ShadSeparator,
} from "@/components/ui/separator"
import {
  Slider as ShadSlider,
} from "@/components/ui/slider"
import {
  Switch as ShadSwitch,
} from "@/components/ui/switch"
import {
  Table as ShadTable,
  TableBody as ShadTableBody,
  TableCaption as ShadTableCaption,
  TableCell as ShadTableCell,
  TableHead as ShadTableHead,
  TableRow as ShadTableRow,
} from "@/components/ui/table"
import {
  Textarea as ShadTextarea,
} from "@/components/ui/textarea"
import {
  Tooltip as ShadTooltip,
  TooltipContent as ShadTooltipContent,
  TooltipProvider as ShadTooltipProvider,
  TooltipTrigger as ShadTooltipTrigger,
} from "@/components/ui/tooltip"
import {
  useFormField as ShaduseFormField,
} from "@/components/ui/form"
import {
  useForm as ShaduseForm,
} from "react-hook-form"
import {
  zodResolver as ShadzodResolver,
} from "@hookform/resolvers/zod"
import {
  Form as ShadForm,
  FormControl as ShadFormControl,
  FormDescription as ShadFormDescription,
  FormField as ShadFormField,
  FormItem as ShadFormItem,
  FormLabel as ShadFormLabel,
  FormMessage as ShadFormMessage,
} from "@/components/ui/form"
import {
  Input as ShadInput,
} from "@/components/ui/input"
import {
  Label as ShadLabel,
} from "@/components/ui/label"
import {
  Select as ShadSelect,
  SelectContent as ShadSelectContent,
  SelectItem as ShadSelectItem,
  SelectTrigger as SelectTrigger,
  SelectValue as SelectValue,
} from "@/components/ui/select"
import {
  Separator as ShadSeparator,
} from "@/components/ui/separator"
import {
  Slider as ShadSlider,
} from "@/components/ui/slider"
import {
  Switch as ShadSwitch,
} from "@/components/ui/switch"
import {
  Table as ShadTable,
  TableBody as ShadTableBody,
  TableCaption as ShadTableCaption,
  TableCell as ShadTableCell,
  TableHead as ShadTableHead,
  TableRow as ShadTableRow,
} from "@/components/ui/table"
import {
  Textarea as ShadTextarea,
} from "@/components/ui/textarea"
import {
  Tooltip as ShadTooltip,
  TooltipContent as ShadTooltipContent,
  TooltipProvider as TooltipProvider,
  TooltipTrigger as TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  useFormField as ShaduseFormField,
} from "@/components/ui/form"
import {
  useForm as ShaduseForm,
} from "react-hook-form"
import {
  zodResolver as ShadzodResolver,
} from "@hookform/resolvers/zod"
import {
  Form as ShadForm,
  FormControl as ShadFormControl,
  FormDescription as ShadFormDescription,
  FormField as ShadFormField,
  FormItem as ShadFormItem,
  FormLabel as ShadFormLabel,
  FormMessage as ShadFormMessage,
} from "@/components/ui/form"
import {
  Input as ShadInput,
} from "@/components/ui/input"
import {
  Label as ShadLabel,
} from "@/components/ui/label"
import {
  Select as ShadSelect,
  SelectContent as ShadSelectContent,
  SelectItem as ShadSelectItem,
  SelectTrigger as ShadSelectTrigger,
  SelectValue as ShadSelectValue,
} from "@/components/ui/select"
import {
  Separator as ShadSeparator,
} from "@/components/ui/separator"
import {
  Slider as ShadSlider,
} from "@/components/ui/slider"
import {
  Switch as ShadSwitch,
} from "@/components/ui/switch"
import {
  Table as ShadTable,
  TableBody as ShadTableBody,
  TableCaption as ShadTableCaption,
  TableCell as ShadTableCell,
  TableHead as ShadTableHead,
  TableRow as ShadTableRow,
} from "@/components/ui/table"
import {
  Textarea as ShadTextarea,
} from "@/components/ui/textarea"
import {
  Tooltip as ShadTooltip,
  TooltipContent as ShadTooltipContent,
  TooltipProvider as ShadTooltipProvider,
  TooltipTrigger as ShadTooltipTrigger,
} from "@/components/ui/tooltip"
import {
  useFormField as ShaduseFormField,
} from "@/components/ui/form"
import {
  useForm as ShaduseForm,
} from "react-hook-form"
import {
  zodResolver as ShadzodResolver,
} from "@hookform/resolvers/zod"
import {
  Form as ShadForm,
  FormControl as ShadFormControl,
  FormDescription as ShadFormDescription,
  FormField as ShadFormField,
  FormItem as ShadFormItem,
  FormLabel as ShadFormLabel,
  FormMessage as ShadFormMessage,
} from "@/components/ui/form"
import {
  Input as ShadInput,
} from "@/components/ui/input"
import {
  Label as ShadLabel,
} from "@/components/ui/label"
import {
  Select as ShadSelect,
  SelectContent as ShadSelectContent,
  SelectItem as ShadSelectItem,
