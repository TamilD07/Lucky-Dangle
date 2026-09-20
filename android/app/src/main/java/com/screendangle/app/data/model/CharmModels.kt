package com.screendangle.app.data.model

import com.screendangle.app.R
import org.json.JSONArray
import org.json.JSONObject

enum class CharmCategory {
    TRADITIONAL, PROTECTION, LUCKY, CUTE, MINIMAL, CUSTOM
}

enum class CharmType {
    VECTOR, EMOJI, TEXT, IMAGE, COMPOSITE, SIGIL
}

enum class EmojiMaterialStyle {
    STICKER, GOLD, SILVER, NEON, GEMSTONE, GLASS, WOOD, SEAL
}

enum class CharmContainerShape {
    CIRCLE, ROUNDED_RECT, OCTAGON, DIAMOND, SHIELD, PETAL
}

enum class SigilStyle {
    ORIGINAL, SILHOUETTE, LINE_ART, MONOCHROME, SYMBOL, GLOW, ENGRAVED
}

enum class SigilMaterial {
    GOLD, SILVER, ROSE_GOLD, BLACK_METAL, CRYSTAL, GLASS, NEON, STONE, WOOD
}

data class CharmBead(
    val type: String,
    val colorHex: String = "#FBBF24",
    val radiusDp: Float = 4f,
    val offsetDp: Float = 36f,
    val drawableResId: Int? = null,
    val emoji: String? = null
)

data class ChainConnector(
    val type: String = "jump_ring", // jump_ring, split_ring, bail, kumihimo_knot, swivel
    val material: String = "gold",
    val colorHex: String = "#D4AF37"
)

data class ChainFinalDangle(
    val type: String = "tassel", // tassel, bell, crystal, teardrop, coin, none
    val colorHex: String = "#DC2626",
    val sizeDp: Float = 24f,
    val lengthDp: Float = 24f
)

data class ComponentChainConfig(
    val connector: ChainConnector = ChainConnector(),
    val afterComponents: List<CharmBead> = emptyList(),
    val finalDangle: ChainFinalDangle? = null
)

data class Charm(
    val id: String,
    val name: String,
    val origin: String,
    val category: CharmCategory,
    val type: CharmType,
    val description: String,
    val ritualText: String,
    val ritualKind: String,
    val defaultRopeLengthDp: Float = 135f,
    val defaultScale: Float = 1.0f,
    val cordColorHex: String = "#61451F",
    val drawableResId: Int? = null,
    val beads: List<CharmBead> = emptyList(),
    val emoji: String? = null,
    val emojiMaterial: EmojiMaterialStyle = EmojiMaterialStyle.STICKER,
    val containerShape: CharmContainerShape = CharmContainerShape.CIRCLE,
    val text: String? = null,
    val accentColorHex: String = "#6366F1",
    val secondaryColorHex: String = "#D4AF37",
    val sigilStyle: SigilStyle = SigilStyle.ORIGINAL,
    val sigilMaterial: SigilMaterial = SigilMaterial.GOLD,
    val imageBase64: String? = null,
    val componentChain: ComponentChainConfig? = null,
    val virtualWeight: String = "medium" // light, medium, heavy
)

data class StringMaterialItem(
    val id: String,
    val name: String,
    val description: String = "",
    val colorHex: String,
    val sheenHex: String,
    val shadowHex: String,
    val defaultWidth: Float = 2.4f
)

object StringMaterialsCatalog {
    val MATERIALS = listOf(
        StringMaterialItem("gold", "Gilded Kumihimo", "Metallic twisted gold weave", "#D4AF37", "#FEF08A", "#78350F", 2.4f),
        StringMaterialItem("redSilk", "Imperial Red Silk", "Traditional crimson woven silk", "#DC2626", "#FCA5A5", "#7F1D1D", 2.2f),
        StringMaterialItem("midnight", "Obsidian & Onyx", "Deep midnight satin cord", "#1E293B", "#94A3B8", "#090D16", 2.4f),
        StringMaterialItem("jute", "Artisan Flax Twine", "Earthy rustic organic thread", "#B45309", "#FDE68A", "#451A03", 2.6f),
        StringMaterialItem("indigo", "Edo Indigo Cord", "Japanese dyed indigo strand", "#3730A3", "#818CF8", "#1E1B4B", 2.2f),
        StringMaterialItem("silver", "Sterling Silver Thread", "Luminous polished silver wire", "#CBD5E1", "#FFFFFF", "#475569", 2.0f),
        StringMaterialItem("roseGold", "Rose Gold Filigree", "Warm blush copper-gold braid", "#E11D48", "#FECDD3", "#881337", 2.2f)
    )

    fun getMaterialById(id: String): StringMaterialItem {
        return MATERIALS.find { it.id == id } ?: MATERIALS[0]
    }
}

data class PhysicsPreset(
    val id: String,
    val name: String,
    val description: String,
    val icon: String,
    val gravity: Float,
    val damping: Float,
    val stiffness: Float,
    val cordFlexibility: Float,
    val waveStrength: Float,
    val charmWeight: String
)

object PhysicsPresetsCatalog {
    val PRESETS = listOf(
        PhysicsPreset("gentle", "Gentle Breeze", "Subtle, quiet and calming sway", "🍃", 8.5f, 0.945f, 0.18f, 0.4f, 0.4f, "light"),
        PhysicsPreset("natural", "Natural Hang", "Balanced real-world physical hanging object", "🌍", 9.8f, 0.982f, 0.15f, 0.7f, 1.0f, "medium"),
        PhysicsPreset("windy", "Windy Gusts", "Noticeable swing with traveling wave propagation", "💨", 9.2f, 0.988f, 0.12f, 0.9f, 1.8f, "medium"),
        PhysicsPreset("bouncy", "Bouncy Spring", "Elastic snap-back and responsive spring", "⚡", 12.5f, 0.970f, 0.35f, 0.5f, 0.8f, "light"),
        PhysicsPreset("heavy", "Cast Iron Heavy", "Heavy solid momentum and slow deep oscillation", "⚓", 11.0f, 0.993f, 0.22f, 0.35f, 0.5f, "heavy"),
        PhysicsPreset("light", "Featherweight", "Fast, hyper-responsive playful reaction to swipes", "🪶", 7.5f, 0.965f, 0.10f, 0.95f, 1.5f, "very_light"),
        PhysicsPreset("floating", "Lunar Floating", "Dreamy low-gravity floating motion with long hang-time", "🌙", 4.2f, 0.994f, 0.08f, 0.85f, 1.2f, "very_light")
    )
}

data class DangleSettingsModel(
    val isEnabled: Boolean = false,
    val selectedCharmId: String = "daruma",
    val ropeLength: Float = 135f,
    val charmSize: Int = 56,
    val swingIntensity: Float = 1.0f,
    val horizontalPercent: Float = 0.72f,
    val reduceMotion: Boolean = false,
    val soundEnabled: Boolean = true,
    val onboardingCompleted: Boolean = false,
    val touchPassthrough: Boolean = false,
    val stringMaterialId: String = "gold",
    val stringThickness: Float = 2.4f,
    val gravity: Float = 9.8f,
    val damping: Float = 0.982f,
    val stiffness: Float = 0.15f,
    val cordFlexibility: Float = 0.7f,
    val waveStrength: Float = 1.0f,
    val charmWeight: String = "medium",
    val customCharmsJson: String = ""
)

object CharmCatalog {
    val BUILT_IN_CHARMS = listOf(
        Charm(
            id = "daruma",
            name = "Daruma Doll",
            origin = "Japan",
            category = CharmCategory.TRADITIONAL,
            type = CharmType.IMAGE,
            description = "Traditional Japanese wishing doll. Paint one eye when wishing, and the second when fulfilled.",
            ritualText = "Paint eye & make a wish",
            ritualKind = "daruma",
            drawableResId = R.drawable.daruma,
            cordColorHex = "#61451F",
            beads = listOf(
                CharmBead("gold", "#FBBF24", 4f, 32f),
                CharmBead("white", "#F8FAFC", 5.5f, 42f),
                CharmBead("gold", "#FBBF24", 4f, 52f)
            ),
            componentChain = ComponentChainConfig(
                connector = ChainConnector("kumihimo_knot", "gold", "#D4AF37"),
                afterComponents = listOf(
                    CharmBead("gold", "#FBBF24", 3.5f, 6f),
                    CharmBead("crimson", "#DC2626", 4.5f, 14f)
                ),
                finalDangle = ChainFinalDangle("tassel", "#DC2626", 26f, 26f)
            )
        ),
        Charm(
            id = "ghanta",
            name = "Ghanta (Temple Bell)",
            origin = "India",
            category = CharmCategory.TRADITIONAL,
            type = CharmType.IMAGE,
            description = "Sacred bronze temple bell rung to dispel negative energy and sharpen clarity.",
            ritualText = "Ring the bell",
            ritualKind = "ghanta",
            drawableResId = R.drawable.ghanta,
            cordColorHex = "#61451F",
            beads = listOf(
                CharmBead("gold", "#FBBF24", 4f, 30f),
                CharmBead("red", "#B91C1C", 5.5f, 40f),
                CharmBead("gold", "#FBBF24", 4f, 50f)
            ),
            componentChain = ComponentChainConfig(
                connector = ChainConnector("bail", "gold", "#EAB308"),
                afterComponents = emptyList(),
                finalDangle = ChainFinalDangle("bell", "#D4AF37", 20f, 20f)
            )
        ),
        Charm(
            id = "nimbu-mirchi",
            name = "Nimbu-mirchi Garland",
            origin = "India",
            category = CharmCategory.PROTECTION,
            type = CharmType.COMPOSITE,
            description = "Seven fiery green chilies, an auspicious yellow lemon, and coal hung at the threshold to turn away Alakshmi.",
            ritualText = "Hang a fresh garland",
            ritualKind = "garland",
            drawableResId = R.drawable.nimbu_lemon,
            cordColorHex = "#451A03"
        ),
        Charm(
            id = "drishti-bommai",
            name = "Drishti Bommai",
            origin = "South India",
            category = CharmCategory.PROTECTION,
            type = CharmType.IMAGE,
            description = "Traditional fearsome terracotta guardian mask painted to ward off evil glances.",
            ritualText = "Repaint the guardian",
            ritualKind = "drishti",
            drawableResId = R.drawable.drishti_bommai,
            cordColorHex = "#451A03",
            beads = listOf(
                CharmBead("gold", "#FBBF24", 4f, 32f),
                CharmBead("crimson", "#DC2626", 5.5f, 42f),
                CharmBead("gold", "#FBBF24", 4f, 52f)
            )
        ),
        Charm(
            id = "chinese-knot",
            name = "Páncháng jié (Chinese Knot)",
            origin = "China",
            category = CharmCategory.LUCKY,
            type = CharmType.IMAGE,
            description = "Endless knot woven from a single crimson cord, embodying longevity and prosperity.",
            ritualText = "Tie in good fortune",
            ritualKind = "knot",
            drawableResId = R.drawable.chinese_knot,
            cordColorHex = "#991B1B",
            beads = listOf(
                CharmBead("red", "#DC2626", 4f, 28f),
                CharmBead("gold", "#FBBF24", 5.5f, 38f),
                CharmBead("red", "#DC2626", 4f, 48f)
            ),
            componentChain = ComponentChainConfig(
                connector = ChainConnector("kumihimo_knot", "cord", "#DC2626"),
                afterComponents = listOf(CharmBead("jade", "#059669", 5f, 10f)),
                finalDangle = ChainFinalDangle("tassel", "#DC2626", 30f, 30f)
            )
        ),
        Charm(
            id = "nazar-boba",
            name = "3D Boba Tea Nazar",
            origin = "Modern Talisman",
            category = CharmCategory.CUTE,
            type = CharmType.IMAGE,
            description = "Hyper-realistic glass boba milk tea cup infused with 3D glass evil-eye pearls.",
            ritualText = "Shake the boba",
            ritualKind = "boba",
            drawableResId = R.drawable.nazar_boba,
            cordColorHex = "#D97706"
        ),
        Charm(
            id = "maneki-neko",
            name = "Maneki-neko",
            origin = "Japan",
            category = CharmCategory.LUCKY,
            type = CharmType.IMAGE,
            description = "The lucky beckoning cat with a golden koban coin inviting good fortune.",
            ritualText = "Beckon good fortune",
            ritualKind = "maneki",
            drawableResId = R.drawable.maneki_neko,
            cordColorHex = "#61451F"
        ),
        Charm(
            id = "horseshoe",
            name = "Auspicious Horseshoe",
            origin = "Europe & Americas",
            category = CharmCategory.LUCKY,
            type = CharmType.IMAGE,
            description = "Hung points upward so good fortune never spills out, strung with carved horse bead.",
            ritualText = "Give it a flick",
            ritualKind = "flick",
            drawableResId = R.drawable.horseshoe,
            cordColorHex = "#61451F",
            beads = listOf(
                CharmBead("metal", "#94A3B8", 4f, 30f),
                CharmBead("horseHead", "#94A3B8", 7f, 42f, R.drawable.horse_head_bead),
                CharmBead("metal", "#94A3B8", 4f, 54f)
            )
        ),
        Charm(
            id = "hamsa",
            name = "Hand of Hamsa",
            origin = "Middle East",
            category = CharmCategory.PROTECTION,
            type = CharmType.IMAGE,
            description = "Sacred open palm of divine protection, strength, and blessings.",
            ritualText = "Give it a flick",
            ritualKind = "flick",
            drawableResId = R.drawable.hamsa,
            cordColorHex = "#61451F"
        ),
        Charm(
            id = "scarab",
            name = "Egyptian Scarab",
            origin = "Ancient Egypt",
            category = CharmCategory.PROTECTION,
            type = CharmType.IMAGE,
            description = "Sacred Khepri beetle talisman representing the rising sun and perpetual renewal.",
            ritualText = "Spread the wings",
            ritualKind = "scarab",
            drawableResId = R.drawable.scarab,
            cordColorHex = "#61451F"
        ),
        Charm(
            id = "himmeli",
            name = "Finnish Himmeli",
            origin = "Finland",
            category = CharmCategory.TRADITIONAL,
            type = CharmType.IMAGE,
            description = "Geometric golden rye straw crown suspended to welcome an abundant harvest.",
            ritualText = "Set it turning",
            ritualKind = "himmeli",
            drawableResId = R.drawable.himmeli,
            cordColorHex = "#78350F"
        ),
        Charm(
            id = "clover-emoji",
            name = "Golden Four-Leaf Clover",
            origin = "Celtic / Universal",
            category = CharmCategory.LUCKY,
            type = CharmType.EMOJI,
            description = "Auspicious emerald four-leaf clover cast in 24K solid gold bezel.",
            ritualText = "Make a wish",
            ritualKind = "flick",
            emoji = "🍀",
            emojiMaterial = EmojiMaterialStyle.GOLD,
            containerShape = CharmContainerShape.CIRCLE,
            cordColorHex = "#D4AF37"
        ),
        Charm(
            id = "evil-eye-emoji",
            name = "Glass Nazar Amulet",
            origin = "Mediterranean",
            category = CharmCategory.PROTECTION,
            type = CharmType.EMOJI,
            description = "Luminous cobalt eye guarding against envy and harmful intentions.",
            ritualText = "Wards evil off",
            ritualKind = "flick",
            emoji = "🧿",
            emojiMaterial = EmojiMaterialStyle.GEMSTONE,
            containerShape = CharmContainerShape.CIRCLE,
            cordColorHex = "#3730A3"
        ),
        Charm(
            id = "dragon-sigil",
            name = "Imperial Dragon Sigil",
            origin = "East Asia",
            category = CharmCategory.LUCKY,
            type = CharmType.EMOJI,
            description = "Mighty coiled celestial dragon radiating primordial power.",
            ritualText = "Unleash power",
            ritualKind = "flick",
            emoji = "🐉",
            emojiMaterial = EmojiMaterialStyle.SEAL,
            containerShape = CharmContainerShape.OCTAGON,
            cordColorHex = "#DC2626"
        )
    )

    fun parseCustomCharms(json: String?): List<Charm> {
        if (json.isNullOrBlank()) return emptyList()
        val list = mutableListOf<Charm>()
        try {
            val array = JSONArray(json)
            for (i in 0 until array.length()) {
                val obj = array.getJSONObject(i)
                val typeStr = obj.optString("type", "EMOJI")
                val type = try { CharmType.valueOf(typeStr) } catch (_: Exception) { CharmType.EMOJI }
                val matStr = obj.optString("emojiMaterial", "STICKER")
                val emojiMat = try { EmojiMaterialStyle.valueOf(matStr) } catch (_: Exception) { EmojiMaterialStyle.STICKER }
                val shapeStr = obj.optString("containerShape", "CIRCLE")
                val containerShape = try { CharmContainerShape.valueOf(shapeStr) } catch (_: Exception) { CharmContainerShape.CIRCLE }

                list.add(
                    Charm(
                        id = obj.getString("id"),
                        name = obj.optString("name", "Custom Charm"),
                        origin = obj.optString("origin", "Custom"),
                        category = CharmCategory.CUSTOM,
                        type = type,
                        description = obj.optString("description", "Personal talisman"),
                        ritualText = obj.optString("ritualText", "Swing for good luck"),
                        ritualKind = "custom",
                        cordColorHex = obj.optString("cordColorHex", "#D4AF37"),
                        emoji = if (obj.has("emoji")) obj.getString("emoji") else null,
                        emojiMaterial = emojiMat,
                        containerShape = containerShape,
                        text = if (obj.has("text")) obj.getString("text") else null,
                        accentColorHex = obj.optString("accentColorHex", "#4F46E5"),
                        secondaryColorHex = obj.optString("secondaryColorHex", "#FBBF24"),
                        imageBase64 = if (obj.has("imageBase64")) obj.getString("imageBase64") else null
                    )
                )
            }
        } catch (_: Exception) {}
        return list
    }

    fun encodeCustomCharms(charms: List<Charm>): String {
        val array = JSONArray()
        for (charm in charms) {
            val obj = JSONObject()
            obj.put("id", charm.id)
            obj.put("name", charm.name)
            obj.put("origin", charm.origin)
            obj.put("type", charm.type.name)
            obj.put("description", charm.description)
            obj.put("ritualText", charm.ritualText)
            obj.put("cordColorHex", charm.cordColorHex)
            obj.put("emojiMaterial", charm.emojiMaterial.name)
            obj.put("containerShape", charm.containerShape.name)
            charm.emoji?.let { obj.put("emoji", it) }
            charm.text?.let { obj.put("text", it) }
            charm.imageBase64?.let { obj.put("imageBase64", it) }
            obj.put("accentColorHex", charm.accentColorHex)
            obj.put("secondaryColorHex", charm.secondaryColorHex)
            array.put(obj)
        }
        return array.toString()
    }

    fun getAllCharms(customCharmsJson: String? = null): List<Charm> {
        val custom = parseCustomCharms(customCharmsJson)
        return BUILT_IN_CHARMS + custom
    }

    fun getCharmById(id: String, customCharmsJson: String? = null): Charm {
        val all = getAllCharms(customCharmsJson)
        return all.find { it.id == id } ?: BUILT_IN_CHARMS[0]
    }
}
