package com.screendangle.app.data.model

import com.screendangle.app.R

enum class CharmCategory {
    TRADITIONAL, PROTECTION, LUCKY, CUTE, MINIMAL, CUSTOM
}

enum class CharmType {
    VECTOR, EMOJI, TEXT, IMAGE, COMPOSITE
}

data class CharmBead(
    val type: String,
    val colorHex: String = "#FBBF24",
    val radiusDp: Float = 4f,
    val offsetDp: Float = 36f,
    val drawableResId: Int? = null
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
    val text: String? = null,
    val accentColorHex: String = "#6366F1",
    val secondaryColorHex: String = "#D4AF37"
)

data class PhysicsConfig(
    val gravity: Float = 9.8f,
    val damping: Float = 0.982f,
    val stiffness: Float = 0.15f,
    val ropeLengthDp: Float = 135f,
    val mass: Float = 1.2f,
    val swingIntensity: Float = 1.0f,
    val movementResponse: Float = 1.2f,
    val maxAngleDeg: Float = 72f,
    val reduceMotion: Boolean = false
)

data class DangleSettingsModel(
    val isEnabled: Boolean = false,
    val selectedCharmId: String = "daruma",
    val ropeLength: Float = 135f,
    val charmSize: Int = 56,
    val swingIntensity: Float = 1.0f,
    val horizontalPercent: Float = 0.72f,
    val reduceMotion: Boolean = false,
    val soundEnabled: Boolean = true,
    val onboardingCompleted: Boolean = false
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
        )
    )

    fun getCharmById(id: String): Charm {
        return BUILT_IN_CHARMS.find { it.id == id } ?: BUILT_IN_CHARMS[0]
    }
}
