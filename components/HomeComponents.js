import React, { memo, useMemo } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const SectionHeader = memo(function SectionHeader({ title, icon, actionLabel, onActionPress, colors }) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleRow}>
        {!!icon && <Ionicons name={icon} size={20} color={colors.primary} />}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {!!actionLabel && !!onActionPress && (
        <Pressable onPress={onActionPress} accessibilityRole="button" accessibilityLabel={actionLabel} hitSlop={8} style={({ pressed }) => pressed && styles.pressed}>
          <Text style={styles.sectionAction}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
});

export const DeadlineCard = memo(function DeadlineCard({ item, university, colors, width }) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={[styles.deadlineCard, { width }]} accessibilityLabel={`${university.name}, example closing date ${item.closingDate}, mock timeline ${item.daysRemaining} days`}>
      <View style={styles.deadlineTopRow}>
        <View style={styles.logoWrapSmall}>
          <Image source={university.logo} style={styles.logoSmall} resizeMode="contain" accessibilityLabel={`${university.shortName} logo`} />
        </View>
        <View style={styles.deadlineTextWrap}>
          <Text style={styles.deadlineName} numberOfLines={2}>{university.name}</Text>
          <Text style={styles.deadlineDate} numberOfLines={2}>Closes {item.closingDate}</Text>
        </View>
      </View>
      <View style={styles.deadlineFooter}>
        <View style={styles.exampleBadge}><Text style={styles.exampleBadgeText}>EXAMPLE DATA</Text></View>
        <View style={styles.daysBadge}><Text style={styles.daysBadgeText}>{item.daysRemaining} days · mock</Text></View>
      </View>
    </View>
  );
});

export const APSScoreRow = memo(function APSScoreRow({ university, score, colors }) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.apsRow} accessibilityLabel={`${university.name}, current APS score ${score}`}>
      <View style={styles.logoWrapMedium}>
        <Image source={university.logo} style={styles.logoMedium} resizeMode="contain" accessibilityLabel={`${university.shortName} logo`} />
      </View>
      <View style={styles.apsNameWrap}>
        <Text style={styles.apsName} numberOfLines={2}>{university.name}</Text>
        <Text style={styles.apsDefault}>Not calculated yet</Text>
      </View>
      <View style={styles.apsValueWrap}><Text style={styles.apsValue}>{score}</Text><Text style={styles.apsLabel}>APS</Text></View>
    </View>
  );
});

export const HomeUniversityCard = memo(function HomeUniversityCard({ university, onPress, colors, width }) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const applicationTag = university.applicationFee === 0
    ? university.applicationFeeLabel || "Free to apply"
    : `Application fee R${university.applicationFee}`;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Open ${university.name} details`} style={({ pressed }) => [styles.universityCard, { width }, pressed && styles.cardPressed]}>
      <Image source={university.image} style={styles.universityImage} resizeMode="cover" accessibilityLabel={`${university.name} campus`} />
      <View style={styles.universityBody}>
        <View style={styles.universityIdentity}>
          <View style={styles.logoWrapMedium}><Image source={university.logo} style={styles.logoMedium} resizeMode="contain" accessibilityLabel={`${university.shortName} logo`} /></View>
          <View style={styles.universityNameWrap}>
            <Text style={styles.universityName} numberOfLines={2}>{university.name}</Text>
            <View style={styles.locationRow}><Ionicons name="location-outline" size={14} color={colors.mutedText} /><Text style={styles.universityLocation} numberOfLines={1}>{university.province}</Text></View>
          </View>
        </View>
        <View style={styles.tagRow}>
          <View style={styles.neutralTag}><Text style={styles.neutralTagText}>{university.type}</Text></View>
          <View style={styles.applicationTag}><Text style={styles.applicationTagText} numberOfLines={1}>{applicationTag}</Text></View>
        </View>
      </View>
    </Pressable>
  );
});

export const ViewAllUniversitiesCard = memo(function ViewAllUniversitiesCard({ onPress, colors, width }) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="View all universities" style={({ pressed }) => [styles.viewAllCard, { width }, pressed && styles.cardPressed]}>
      <View style={styles.viewAllIcon}><Ionicons name="business-outline" size={30} color={colors.primary} /></View>
      <Text style={styles.viewAllTitle}>View All Universities</Text>
      <Text style={styles.viewAllText}>Explore every available institution</Text>
      <Ionicons name="arrow-forward" size={22} color={colors.primary} />
    </Pressable>
  );
});

export const QuickActionCard = memo(function QuickActionCard({ title, subtitle, icon, onPress, colors }) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${title}. ${subtitle}`} style={({ pressed }) => [styles.quickActionCard, pressed && styles.cardPressed]}>
      <View style={styles.quickIconWrap}><Ionicons name={icon} size={23} color={colors.primary} /></View>
      <Text style={styles.quickTitle} numberOfLines={1}>{title}</Text>
      <Text style={styles.quickSubtitle} numberOfLines={2}>{subtitle}</Text>
    </Pressable>
  );
});

const createStyles = (colors) => StyleSheet.create({
  pressed: { opacity: 0.58 },
  cardPressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
  sectionHeader: { minHeight: 44, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  sectionTitleRow: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: 8 },
  sectionTitle: { flexShrink: 1, color: colors.text, fontSize: 19, lineHeight: 25, fontWeight: "900" },
  sectionAction: { color: colors.primary, fontSize: 13, fontWeight: "800" },
  deadlineCard: { minHeight: 174, padding: 16, borderRadius: 20, borderWidth: 1, borderColor: colors.border, justifyContent: "space-between", backgroundColor: colors.surface, shadowColor: "#071B19", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3 },
  deadlineTopRow: { flexDirection: "row", alignItems: "flex-start" },
  deadlineTextWrap: { flex: 1, minWidth: 0, marginLeft: 12 },
  deadlineName: { color: colors.text, fontSize: 15, lineHeight: 21, fontWeight: "800" },
  deadlineDate: { marginTop: 6, color: colors.secondaryText, fontSize: 12, lineHeight: 18 },
  deadlineFooter: { marginTop: 16, flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 7 },
  exampleBadge: { paddingHorizontal: 9, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.elevatedSurface },
  exampleBadgeText: { color: colors.mutedText, fontSize: 9, fontWeight: "900", letterSpacing: 0.5 },
  daysBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.primarySoft },
  daysBadgeText: { color: colors.primary, fontSize: 11, fontWeight: "800" },
  logoWrapSmall: { width: 46, height: 46, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: colors.border },
  logoSmall: { width: 38, height: 38 },
  logoWrapMedium: { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: colors.border },
  logoMedium: { width: 44, height: 44 },
  apsRow: { minHeight: 82, marginTop: 10, padding: 13, borderRadius: 18, borderWidth: 1, borderColor: colors.border, flexDirection: "row", alignItems: "center", backgroundColor: colors.surface },
  apsNameWrap: { flex: 1, minWidth: 0, marginHorizontal: 12 },
  apsName: { color: colors.text, fontSize: 14, lineHeight: 19, fontWeight: "800" },
  apsDefault: { marginTop: 4, color: colors.mutedText, fontSize: 11 },
  apsValueWrap: { minWidth: 48, alignItems: "flex-end" },
  apsValue: { color: colors.primary, fontSize: 25, lineHeight: 28, fontWeight: "900" },
  apsLabel: { marginTop: 1, color: colors.primary, fontSize: 10, fontWeight: "900" },
  universityCard: { overflow: "hidden", borderRadius: 22, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, shadowColor: "#071B19", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.12, shadowRadius: 10, elevation: 4 },
  universityImage: { width: "100%", height: 146 },
  universityBody: { flex: 1, padding: 15 },
  universityIdentity: { flexDirection: "row", alignItems: "center" },
  universityNameWrap: { flex: 1, minWidth: 0, marginLeft: 11 },
  universityName: { color: colors.text, fontSize: 15, lineHeight: 20, fontWeight: "900" },
  locationRow: { marginTop: 5, flexDirection: "row", alignItems: "center" },
  universityLocation: { flex: 1, marginLeft: 3, color: colors.mutedText, fontSize: 12 },
  tagRow: { marginTop: 14, flexDirection: "row", flexWrap: "wrap", gap: 7 },
  neutralTag: { paddingHorizontal: 9, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.elevatedSurface },
  neutralTagText: { color: colors.secondaryText, fontSize: 10, fontWeight: "800" },
  applicationTag: { flexShrink: 1, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.primarySoft },
  applicationTagText: { flexShrink: 1, color: colors.primary, fontSize: 10, fontWeight: "800" },
  viewAllCard: { minHeight: 281, padding: 20, borderRadius: 22, borderWidth: 1.5, borderStyle: "dashed", borderColor: colors.primary, alignItems: "center", justifyContent: "center", backgroundColor: colors.primarySoft },
  viewAllIcon: { width: 62, height: 62, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface },
  viewAllTitle: { marginTop: 18, color: colors.text, fontSize: 16, lineHeight: 21, fontWeight: "900", textAlign: "center" },
  viewAllText: { marginVertical: 8, color: colors.secondaryText, fontSize: 12, lineHeight: 18, textAlign: "center" },
  quickActionCard: { flexGrow: 1, flexBasis: "46%", minHeight: 137, padding: 16, borderRadius: 19, borderWidth: 1, borderColor: colors.border, justifyContent: "center", backgroundColor: colors.surface },
  quickIconWrap: { width: 45, height: 45, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: colors.primarySoft },
  quickTitle: { marginTop: 14, color: colors.text, fontSize: 14, fontWeight: "900" },
  quickSubtitle: { marginTop: 6, color: colors.mutedText, fontSize: 12, lineHeight: 17 },
});
