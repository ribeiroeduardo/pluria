export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      builds: {
        Row: {
          body_color: string | null
          body_wood: string | null
          bridge: string | null
          burst: string | null
          case_type: string | null
          certificado: string | null
          chave_allen_25mm: string | null
          created_at: string | null
          custo: number | null
          feltro: string | null
          ferrules: string | null
          fretboard_radius: string | null
          fretboard_wood: string | null
          frets: string | null
          hardware_color: string | null
          headstock_angle: string | null
          id: number
          id_user: string | null
          inlays: string | null
          jack: string | null
          jack_plate: string | null
          knobs: string | null
          marca_pagina: string | null
          neck_construction: string | null
          neck_profile: string | null
          neck_reinforcements: string | null
          neck_wood: string | null
          nut: string | null
          pickups: string | null
          pickups_customization: string | null
          pickups_finish: string | null
          plates: string | null
          porta_certificado: string | null
          preco: number | null
          roldana: string | null
          scale_length: string | null
          side_dots: string | null
          strings: string | null
          switch: string | null
          tag_modelo: string | null
          tag_specs: string | null
          tensor: string | null
          title: string | null
          top_coat: string | null
          top_color: string | null
          top_wood: string | null
          treble_bleed: string | null
          tuners: string | null
          user_email: string | null
          ziplock: string | null
        }
        Insert: {
          body_color?: string | null
          body_wood?: string | null
          bridge?: string | null
          burst?: string | null
          case_type?: string | null
          certificado?: string | null
          chave_allen_25mm?: string | null
          created_at?: string | null
          custo?: number | null
          feltro?: string | null
          ferrules?: string | null
          fretboard_radius?: string | null
          fretboard_wood?: string | null
          frets?: string | null
          hardware_color?: string | null
          headstock_angle?: string | null
          id?: never
          id_user?: string | null
          inlays?: string | null
          jack?: string | null
          jack_plate?: string | null
          knobs?: string | null
          marca_pagina?: string | null
          neck_construction?: string | null
          neck_profile?: string | null
          neck_reinforcements?: string | null
          neck_wood?: string | null
          nut?: string | null
          pickups?: string | null
          pickups_customization?: string | null
          pickups_finish?: string | null
          plates?: string | null
          porta_certificado?: string | null
          preco?: number | null
          roldana?: string | null
          scale_length?: string | null
          side_dots?: string | null
          strings?: string | null
          switch?: string | null
          tag_modelo?: string | null
          tag_specs?: string | null
          tensor?: string | null
          title?: string | null
          top_coat?: string | null
          top_color?: string | null
          top_wood?: string | null
          treble_bleed?: string | null
          tuners?: string | null
          user_email?: string | null
          ziplock?: string | null
        }
        Update: {
          body_color?: string | null
          body_wood?: string | null
          bridge?: string | null
          burst?: string | null
          case_type?: string | null
          certificado?: string | null
          chave_allen_25mm?: string | null
          created_at?: string | null
          custo?: number | null
          feltro?: string | null
          ferrules?: string | null
          fretboard_radius?: string | null
          fretboard_wood?: string | null
          frets?: string | null
          hardware_color?: string | null
          headstock_angle?: string | null
          id?: never
          id_user?: string | null
          inlays?: string | null
          jack?: string | null
          jack_plate?: string | null
          knobs?: string | null
          marca_pagina?: string | null
          neck_construction?: string | null
          neck_profile?: string | null
          neck_reinforcements?: string | null
          neck_wood?: string | null
          nut?: string | null
          pickups?: string | null
          pickups_customization?: string | null
          pickups_finish?: string | null
          plates?: string | null
          porta_certificado?: string | null
          preco?: number | null
          roldana?: string | null
          scale_length?: string | null
          side_dots?: string | null
          strings?: string | null
          switch?: string | null
          tag_modelo?: string | null
          tag_specs?: string | null
          tensor?: string | null
          title?: string | null
          top_coat?: string | null
          top_color?: string | null
          top_wood?: string | null
          treble_bleed?: string | null
          tuners?: string | null
          user_email?: string | null
          ziplock?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          category: string
          id: number
          sort_order: number
        }
        Insert: {
          category: string
          id?: number
          sort_order: number
        }
        Update: {
          category?: string
          id?: number
          sort_order?: number
        }
        Relationships: []
      }
      clients: {
        Row: {
          created_at: string | null
          email: string
          first_name: string | null
          full_name: string | null
          id: string | null
          last_name: string | null
          phone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name?: string | null
          full_name?: string | null
          id?: string | null
          last_name?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string | null
          full_name?: string | null
          id?: string | null
          last_name?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      options: {
        Row: {
          active: boolean
          back_image_url: string | null
          color_hardware: string | null
          front_image_url: string | null
          id: number
          id_related_subcategory: number
          is_default: boolean
          option: string
          price_usd: number
          scale_length: string | null
          strings: string | null
          view: string | null
          zindex: number | null
        }
        Insert: {
          active?: boolean
          back_image_url?: string | null
          color_hardware?: string | null
          front_image_url?: string | null
          id: number
          id_related_subcategory: number
          is_default?: boolean
          option: string
          price_usd?: number
          scale_length?: string | null
          strings?: string | null
          view?: string | null
          zindex?: number | null
        }
        Update: {
          active?: boolean
          back_image_url?: string | null
          color_hardware?: string | null
          front_image_url?: string | null
          id?: number
          id_related_subcategory?: number
          is_default?: boolean
          option?: string
          price_usd?: number
          scale_length?: string | null
          strings?: string | null
          view?: string | null
          zindex?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "options_id_related_subcategory_fkey"
            columns: ["id_related_subcategory"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      subcategories: {
        Row: {
          hidden: boolean | null
          id: number
          id_related_category: number | null
          sort_order: number
          subcategory: string
        }
        Insert: {
          hidden?: boolean | null
          id?: number
          id_related_category?: number | null
          sort_order: number
          subcategory: string
        }
        Update: {
          hidden?: boolean | null
          id?: number
          id_related_category?: number | null
          sort_order?: number
          subcategory?: string
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_id_related_category_fkey"
            columns: ["id_related_category"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
