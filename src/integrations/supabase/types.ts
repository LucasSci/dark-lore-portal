export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      battle_log: {
        Row: {
          action_type: string
          actor_name: string
          created_at: string
          damage: number | null
          description: string
          dice_result: number | null
          dice_roll: string | null
          encounter_id: string
          id: string
          round: number
        }
        Insert: {
          action_type: string
          actor_name: string
          created_at?: string
          damage?: number | null
          description: string
          dice_result?: number | null
          dice_roll?: string | null
          encounter_id: string
          id?: string
          round?: number
        }
        Update: {
          action_type?: string
          actor_name?: string
          created_at?: string
          damage?: number | null
          description?: string
          dice_result?: number | null
          dice_roll?: string | null
          encounter_id?: string
          id?: string
          round?: number
        }
        Relationships: [
          {
            foreignKeyName: "battle_log_encounter_id_fkey"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "combat_encounters"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_events: {
        Row: {
          chapter_number: number
          created_at: string
          description: string | null
          event_type: string | null
          id: string
          location: string | null
          participants: string[] | null
          sort_order: number | null
          title: string
        }
        Insert: {
          chapter_number: number
          created_at?: string
          description?: string | null
          event_type?: string | null
          id?: string
          location?: string | null
          participants?: string[] | null
          sort_order?: number | null
          title: string
        }
        Update: {
          chapter_number?: number
          created_at?: string
          description?: string | null
          event_type?: string | null
          id?: string
          location?: string | null
          participants?: string[] | null
          sort_order?: number | null
          title?: string
        }
        Relationships: []
      }
      campaign_factions: {
        Row: {
          alignment: string | null
          created_at: string
          description: string | null
          headquarters: string | null
          id: string
          leader: string | null
          name: string
        }
        Insert: {
          alignment?: string | null
          created_at?: string
          description?: string | null
          headquarters?: string | null
          id?: string
          leader?: string | null
          name: string
        }
        Update: {
          alignment?: string | null
          created_at?: string
          description?: string | null
          headquarters?: string | null
          id?: string
          leader?: string | null
          name?: string
        }
        Relationships: []
      }
      campaign_locations: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_discovered: boolean | null
          location_type: string | null
          name: string
          region: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_discovered?: boolean | null
          location_type?: string | null
          name: string
          region?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_discovered?: boolean | null
          location_type?: string | null
          name?: string
          region?: string | null
        }
        Relationships: []
      }
      campaign_npcs: {
        Row: {
          created_at: string
          description: string | null
          faction: string | null
          id: string
          is_ally: boolean | null
          location: string | null
          name: string
          portrait_url: string | null
          title: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          faction?: string | null
          id?: string
          is_ally?: boolean | null
          location?: string | null
          name: string
          portrait_url?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          faction?: string | null
          id?: string
          is_ally?: boolean | null
          location?: string | null
          name?: string
          portrait_url?: string | null
          title?: string | null
        }
        Relationships: []
      }
      character_inventory: {
        Row: {
          character_id: string
          equipped: boolean
          id: string
          item_id: string
          quantity: number
        }
        Insert: {
          character_id: string
          equipped?: boolean
          id?: string
          item_id: string
          quantity?: number
        }
        Update: {
          character_id?: string
          equipped?: boolean
          id?: string
          item_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "character_inventory_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_inventory_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      character_skills: {
        Row: {
          bonus: number
          character_id: string
          id: string
          proficient: boolean
          skill_id: string
        }
        Insert: {
          bonus?: number
          character_id: string
          id?: string
          proficient?: boolean
          skill_id: string
        }
        Update: {
          bonus?: number
          character_id?: string
          id?: string
          proficient?: boolean
          skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "character_skills_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      character_spells: {
        Row: {
          character_id: string
          id: string
          prepared: boolean
          spell_id: string
        }
        Insert: {
          character_id: string
          id?: string
          prepared?: boolean
          spell_id: string
        }
        Update: {
          character_id?: string
          id?: string
          prepared?: boolean
          spell_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "character_spells_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_spells_spell_id_fkey"
            columns: ["spell_id"]
            isOneToOne: false
            referencedRelation: "spells"
            referencedColumns: ["id"]
          },
        ]
      }
      characters: {
        Row: {
          appearance: string | null
          armor_class: number
          background: string | null
          carisma: number
          class: Database["public"]["Enums"]["character_class"]
          constituicao: number
          created_at: string
          destreza: number
          experience: number
          forca: number
          gold: number
          hp_current: number
          hp_max: number
          id: string
          initiative_bonus: number
          inteligencia: number
          is_active: boolean
          level: number
          mp_current: number
          mp_max: number
          name: string
          portrait_url: string | null
          race: Database["public"]["Enums"]["character_race"]
          sabedoria: number
          speed: number
          updated_at: string
          user_id: string
        }
        Insert: {
          appearance?: string | null
          armor_class?: number
          background?: string | null
          carisma?: number
          class?: Database["public"]["Enums"]["character_class"]
          constituicao?: number
          created_at?: string
          destreza?: number
          experience?: number
          forca?: number
          gold?: number
          hp_current?: number
          hp_max?: number
          id?: string
          initiative_bonus?: number
          inteligencia?: number
          is_active?: boolean
          level?: number
          mp_current?: number
          mp_max?: number
          name: string
          portrait_url?: string | null
          race?: Database["public"]["Enums"]["character_race"]
          sabedoria?: number
          speed?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          appearance?: string | null
          armor_class?: number
          background?: string | null
          carisma?: number
          class?: Database["public"]["Enums"]["character_class"]
          constituicao?: number
          created_at?: string
          destreza?: number
          experience?: number
          forca?: number
          gold?: number
          hp_current?: number
          hp_max?: number
          id?: string
          initiative_bonus?: number
          inteligencia?: number
          is_active?: boolean
          level?: number
          mp_current?: number
          mp_max?: number
          name?: string
          portrait_url?: string | null
          race?: Database["public"]["Enums"]["character_race"]
          sabedoria?: number
          speed?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      combat_encounters: {
        Row: {
          created_at: string
          current_turn: number
          id: string
          name: string
          round: number
          session_id: string
          status: Database["public"]["Enums"]["combat_status"]
        }
        Insert: {
          created_at?: string
          current_turn?: number
          id?: string
          name?: string
          round?: number
          session_id: string
          status?: Database["public"]["Enums"]["combat_status"]
        }
        Update: {
          created_at?: string
          current_turn?: number
          id?: string
          name?: string
          round?: number
          session_id?: string
          status?: Database["public"]["Enums"]["combat_status"]
        }
        Relationships: [
          {
            foreignKeyName: "combat_encounters_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      combat_participants: {
        Row: {
          character_id: string | null
          conditions: string[] | null
          encounter_id: string
          hp_current: number
          hp_max: number
          id: string
          initiative: number
          is_npc: boolean
          npc_name: string | null
          turn_order: number
        }
        Insert: {
          character_id?: string | null
          conditions?: string[] | null
          encounter_id: string
          hp_current?: number
          hp_max?: number
          id?: string
          initiative?: number
          is_npc?: boolean
          npc_name?: string | null
          turn_order?: number
        }
        Update: {
          character_id?: string | null
          conditions?: string[] | null
          encounter_id?: string
          hp_current?: number
          hp_max?: number
          id?: string
          initiative?: number
          is_npc?: boolean
          npc_name?: string | null
          turn_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "combat_participants_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "combat_participants_encounter_id_fkey"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "combat_encounters"
            referencedColumns: ["id"]
          },
        ]
      }
      dice_rolls: {
        Row: {
          created_at: string
          dice_type: string
          id: string
          label: string | null
          modifier: number
          num_dice: number
          results: number[]
          session_id: string | null
          total: number
          user_id: string
        }
        Insert: {
          created_at?: string
          dice_type: string
          id?: string
          label?: string | null
          modifier?: number
          num_dice?: number
          results: number[]
          session_id?: string | null
          total: number
          user_id: string
        }
        Update: {
          created_at?: string
          dice_type?: string
          id?: string
          label?: string | null
          modifier?: number
          num_dice?: number
          results?: number[]
          session_id?: string | null
          total?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dice_rolls_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      game_sessions: {
        Row: {
          created_at: string
          current_round: number
          description: string | null
          game_master_id: string
          id: string
          is_active: boolean
          max_players: number
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_round?: number
          description?: string | null
          game_master_id: string
          id?: string
          is_active?: boolean
          max_players?: number
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_round?: number
          description?: string | null
          game_master_id?: string
          id?: string
          is_active?: boolean
          max_players?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      items: {
        Row: {
          armor_bonus: number | null
          damage: string | null
          description: string | null
          effect: string | null
          id: string
          is_default: boolean
          item_type: Database["public"]["Enums"]["item_type"]
          name: string
          rarity: Database["public"]["Enums"]["item_rarity"]
          value: number
          weight: number
        }
        Insert: {
          armor_bonus?: number | null
          damage?: string | null
          description?: string | null
          effect?: string | null
          id?: string
          is_default?: boolean
          item_type?: Database["public"]["Enums"]["item_type"]
          name: string
          rarity?: Database["public"]["Enums"]["item_rarity"]
          value?: number
          weight?: number
        }
        Update: {
          armor_bonus?: number | null
          damage?: string | null
          description?: string | null
          effect?: string | null
          id?: string
          is_default?: boolean
          item_type?: Database["public"]["Enums"]["item_type"]
          name?: string
          rarity?: Database["public"]["Enums"]["item_rarity"]
          value?: number
          weight?: number
        }
        Relationships: []
      }
      lore_entries: {
        Row: {
          category: string
          chapter_number: number | null
          content: string | null
          created_at: string
          id: string
          is_published: boolean
          slug: string
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          chapter_number?: number | null
          content?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          slug: string
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          chapter_number?: number | null
          content?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          slug?: string
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string
          id: string
          is_game_master: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          id?: string
          is_game_master?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          id?: string
          is_game_master?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      session_players: {
        Row: {
          character_id: string
          id: string
          joined_at: string
          session_id: string
          user_id: string
        }
        Insert: {
          character_id: string
          id?: string
          joined_at?: string
          session_id: string
          user_id: string
        }
        Update: {
          character_id?: string
          id?: string
          joined_at?: string
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_players_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_players_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          attribute: string
          description: string | null
          id: string
          is_default: boolean
          name: string
        }
        Insert: {
          attribute: string
          description?: string | null
          id?: string
          is_default?: boolean
          name: string
        }
        Update: {
          attribute?: string
          description?: string | null
          id?: string
          is_default?: boolean
          name?: string
        }
        Relationships: []
      }
      spells: {
        Row: {
          casting_time: string
          damage: string | null
          description: string | null
          duration: string
          id: string
          is_default: boolean
          level: number
          mp_cost: number
          name: string
          range: string
          school: Database["public"]["Enums"]["spell_school"]
        }
        Insert: {
          casting_time?: string
          damage?: string | null
          description?: string | null
          duration?: string
          id?: string
          is_default?: boolean
          level?: number
          mp_cost?: number
          name: string
          range?: string
          school?: Database["public"]["Enums"]["spell_school"]
        }
        Update: {
          casting_time?: string
          damage?: string | null
          description?: string | null
          duration?: string
          id?: string
          is_default?: boolean
          level?: number
          mp_cost?: number
          name?: string
          range?: string
          school?: Database["public"]["Enums"]["spell_school"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      character_class:
        | "guerreiro"
        | "mago"
        | "ladino"
        | "clerigo"
        | "ranger"
        | "paladino"
        | "barbaro"
        | "bardo"
        | "druida"
        | "feiticeiro"
        | "bruxo"
        | "monge"
      character_race:
        | "humano"
        | "elfo"
        | "anao"
        | "orc"
        | "tiefling"
        | "draconato"
        | "halfling"
        | "gnomo"
      combat_status: "aguardando" | "em_andamento" | "finalizado"
      item_rarity: "comum" | "incomum" | "raro" | "epico" | "lendario"
      item_type:
        | "arma"
        | "armadura"
        | "pocao"
        | "pergaminho"
        | "material"
        | "miscelanea"
      spell_school:
        | "abjuracao"
        | "conjuracao"
        | "adivinhacao"
        | "encantamento"
        | "evocacao"
        | "ilusao"
        | "necromancia"
        | "transmutacao"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      character_class: [
        "guerreiro",
        "mago",
        "ladino",
        "clerigo",
        "ranger",
        "paladino",
        "barbaro",
        "bardo",
        "druida",
        "feiticeiro",
        "bruxo",
        "monge",
      ],
      character_race: [
        "humano",
        "elfo",
        "anao",
        "orc",
        "tiefling",
        "draconato",
        "halfling",
        "gnomo",
      ],
      combat_status: ["aguardando", "em_andamento", "finalizado"],
      item_rarity: ["comum", "incomum", "raro", "epico", "lendario"],
      item_type: [
        "arma",
        "armadura",
        "pocao",
        "pergaminho",
        "material",
        "miscelanea",
      ],
      spell_school: [
        "abjuracao",
        "conjuracao",
        "adivinhacao",
        "encantamento",
        "evocacao",
        "ilusao",
        "necromancia",
        "transmutacao",
      ],
    },
  },
} as const
