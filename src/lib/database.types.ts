export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
	public: {
		Tables: {
			log: {
				Row: {
					call: string;
					country: string;
					cqz: number | null;
					created_at: string;
					dxcc: number;
					grid: string | null;
					id: number;
					ituz: number | null;
					name: string | null;
					title: string | null;
					user_id: string | null;
				};
				Insert: {
					call: string;
					country: string;
					cqz?: number | null;
					created_at?: string;
					dxcc: number;
					grid?: string | null;
					id?: number;
					ituz?: number | null;
					name?: string | null;
					title?: string | null;
					user_id?: string | null;
				};
				Update: {
					call?: string;
					country?: string;
					cqz?: number | null;
					created_at?: string;
					dxcc?: number;
					grid?: string | null;
					id?: number;
					ituz?: number | null;
					name?: string | null;
					title?: string | null;
					user_id?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'profile_user_id_fkey';
						columns: ['user_id'];
						isOneToOne: false;
						referencedRelation: 'users';
						referencedColumns: ['id'];
					}
				];
			};
			qso: {
				Row: {
					band: string | null;
					call: string;
					comment: string | null;
					country: string | null;
					created_at: string;
					datetime: string;
					dxcc: number;
					frequency: number;
					gridsquare: string | null;
					id: number;
					log_id: number | null;
					mode: string;
					other: Json;
					power: number | null;
					rst_rcvd: string | null;
					rst_sent: string | null;
					updated_at: string;
					user_id: string;
				};
				Insert: {
					band?: string | null;
					call: string;
					comment?: string | null;
					country?: string | null;
					created_at?: string;
					datetime: string;
					dxcc?: number;
					frequency: number;
					gridsquare?: string | null;
					id?: number;
					log_id?: number | null;
					mode: string;
					other?: Json;
					power?: number | null;
					rst_rcvd?: string | null;
					rst_sent?: string | null;
					updated_at?: string;
					user_id?: string;
				};
				Update: {
					band?: string | null;
					call?: string;
					comment?: string | null;
					country?: string | null;
					created_at?: string;
					datetime?: string;
					dxcc?: number;
					frequency?: number;
					gridsquare?: string | null;
					id?: number;
					log_id?: number | null;
					mode?: string;
					other?: Json;
					power?: number | null;
					rst_rcvd?: string | null;
					rst_sent?: string | null;
					updated_at?: string;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'qso_profile_id_fkey';
						columns: ['log_id'];
						isOneToOne: false;
						referencedRelation: 'log';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'qso_user_id_fkey';
						columns: ['user_id'];
						isOneToOne: false;
						referencedRelation: 'users';
						referencedColumns: ['id'];
					}
				];
			};
			user_info: {
				Row: {
					call: string | null;
					default_log_id: number | null;
					id: number;
					name: string | null;
					user_id: string;
				};
				Insert: {
					call?: string | null;
					default_log_id?: number | null;
					id?: number;
					name?: string | null;
					user_id: string;
				};
				Update: {
					call?: string | null;
					default_log_id?: number | null;
					id?: number;
					name?: string | null;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'user_info_default_log_id_fkey';
						columns: ['default_log_id'];
						isOneToOne: false;
						referencedRelation: 'log';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'user_info_user_id_fkey';
						columns: ['user_id'];
						isOneToOne: true;
						referencedRelation: 'users';
						referencedColumns: ['id'];
					}
				];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			[_ in never]: never;
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};

type PublicSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
	PublicTableNameOrOptions extends
		| keyof (PublicSchema['Tables'] & PublicSchema['Views'])
		| { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
				Database[PublicTableNameOrOptions['schema']]['Views'])
		: never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
			Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
			Row: infer R;
		}
		? R
		: never
	: PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] & PublicSchema['Views'])
		? (PublicSchema['Tables'] & PublicSchema['Views'])[PublicTableNameOrOptions] extends {
				Row: infer R;
			}
			? R
			: never
		: never;

export type TablesInsert<
	PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
		: never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Insert: infer I;
		}
		? I
		: never
	: PublicTableNameOrOptions extends keyof PublicSchema['Tables']
		? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
				Insert: infer I;
			}
			? I
			: never
		: never;

export type TablesUpdate<
	PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
		: never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Update: infer U;
		}
		? U
		: never
	: PublicTableNameOrOptions extends keyof PublicSchema['Tables']
		? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
				Update: infer U;
			}
			? U
			: never
		: never;

export type Enums<
	PublicEnumNameOrOptions extends keyof PublicSchema['Enums'] | { schema: keyof Database },
	EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
		: never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
	? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
	: PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
		? PublicSchema['Enums'][PublicEnumNameOrOptions]
		: never;
