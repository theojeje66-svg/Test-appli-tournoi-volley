declare module 'lucide-react' {
	import * as React from 'react';
	export type IconProps = React.SVGProps<SVGSVGElement> & { size?: number; className?: string };

	export const Activity: React.FC<IconProps>;
	export const Trophy: React.FC<IconProps>;
	export const Users: React.FC<IconProps>;
	export const Calendar: React.FC<IconProps>;
	export const Plus: React.FC<IconProps>;
	export const Trash2: React.FC<IconProps>;
	export const Sparkles: React.FC<IconProps>;
	export const Menu: React.FC<IconProps>;
	export const ChevronDown: React.FC<IconProps>;
	export const ChevronUp: React.FC<IconProps>;
	export const UserPlus: React.FC<IconProps>;
	export const User: React.FC<IconProps>;
	export const X: React.FC<IconProps>;
	export const Medal: React.FC<IconProps>;
	export const ArrowLeft: React.FC<IconProps>;
	export const Edit2: React.FC<IconProps>;
	export const FolderPlus: React.FC<IconProps>;
	export const LayoutGrid: React.FC<IconProps>;
	export const Play: React.FC<IconProps>;
	export const CheckCircle: React.FC<IconProps>;

	// fallback for other icons
	const icons: { [key: string]: React.FC<IconProps> };
	export default icons;
}

declare module 'recharts' {
	import * as React from 'react';
	export const ResponsiveContainer: React.FC<any>;
	export const BarChart: React.FC<any>;
	export const XAxis: React.FC<any>;
	export const YAxis: React.FC<any>;
	export const Tooltip: React.FC<any>;
	export const Bar: React.FC<any>;
	export const Cell: React.FC<any>;
	const _default: any;
	export default _default;
}
