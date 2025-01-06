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
					deleted_at: string | null;
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
					deleted_at?: string | null;
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
					deleted_at?: string | null;
					dxcc?: number;
					grid?: string | null;
					id?: number;
					ituz?: number | null;
					name?: string | null;
					title?: string | null;
					user_id?: string | null;
				};
				Relationships: [];
			};
			qso: {
				Row: {
					band: string | null;
					call: string;
					comment: string | null;
					cont: string | null;
					country: string | null;
					created_at: string;
					datetime: string;
					deleted_at: string | null;
					dxcc: number | null;
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
					cont?: string | null;
					country?: string | null;
					created_at?: string;
					datetime: string;
					deleted_at?: string | null;
					dxcc?: number | null;
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
					cont?: string | null;
					country?: string | null;
					created_at?: string;
					datetime?: string;
					deleted_at?: string | null;
					dxcc?: number | null;
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
					}
				];
			};
		};
		Views: {
			qso_band_summary: {
				Row: {
					band: string | null;
					qso_count: number | null;
				};
				Relationships: [];
			};
			qso_call_summary: {
				Row: {
					call: string | null;
					qso_count: number | null;
				};
				Relationships: [];
			};
			qso_cont_summary: {
				Row: {
					cont: string | null;
					qso_count: number | null;
				};
				Relationships: [];
			};
			qso_dxcc_summary: {
				Row: {
					dxcc: number | null;
				};
				Relationships: [];
			};
			qso_grid_log_summary: {
				Row: {
					grid: string | null;
					log_id: number | null;
				};
				Relationships: [
					{
						foreignKeyName: 'qso_profile_id_fkey';
						columns: ['log_id'];
						isOneToOne: false;
						referencedRelation: 'log';
						referencedColumns: ['id'];
					}
				];
			};
			qso_grid_summary: {
				Row: {
					grid: string | null;
				};
				Relationships: [];
			};
			qso_mode_summary: {
				Row: {
					mode: string | null;
					qso_count: number | null;
				};
				Relationships: [];
			};
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

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends
		| keyof PublicSchema['CompositeTypes']
		| { schema: keyof Database },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof Database;
	}
		? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
		: never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
	? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof PublicSchema['CompositeTypes']
		? PublicSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
		: never;
