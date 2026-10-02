import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
} from "react-native";

import { useTranslation } from "react-i18next";

const languages = [
  { code: "en", name: "English" },
  { code: "af", name: "Afrikaans" },
  { code: "nr", name: "isiNdebele" },
  { code: "xh", name: "isiXhosa" },
  { code: "zu", name: "isiZulu" },
  { code: "nso", name: "Sepedi" },
  { code: "st", name: "Sesotho" },
  { code: "tn", name: "Setswana" },
  { code: "ss", name: "siSwati" },
  { code: "ve", name: "Tshivenda" },
  { code: "ts", name: "itsonga" },
];

export default function LanguageSelector() {
  const { t, i18n } = useTranslation();

  const [visible, setVisible] = useState(false);

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
    setVisible(false);
  };

  return (
    <View>
      {/* LANGUAGE BUTTON */}
      <TouchableOpacity
        style={styles.languageButton}
        onPress={() => setVisible(true)}
      >
        <Text style={styles.buttonText}>
          🌐 {t("language")}
        </Text>
      </TouchableOpacity>

      {/* LANGUAGE MODAL */}
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.title}>
              {t("chooseLanguage")}
            </Text>

            <ScrollView
              style={styles.languageList}
              showsVerticalScrollIndicator={true}
            >
              {languages.map((item) => (
                <TouchableOpacity
                  key={item.code}
                  style={styles.option}
                  onPress={() =>
                    changeLanguage(item.code)
                  }
                >
                  <Text style={styles.optionText}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.cancel}
              onPress={() => setVisible(false)}
            >
              <Text style={styles.cancelText}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  languageButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5ECEF",
  },

  buttonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#117C72",
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  modal: {
    backgroundColor: "#FFFFFF",
    width: "85%",
    maxHeight: "75%",
    padding: 20,
    borderRadius: 15,
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },

  languageList: {
    maxHeight: 400,
  },

  option: {
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5ECEF",
  },

  optionText: {
    fontSize: 16,
  },

  cancel: {
    marginTop: 15,
    padding: 12,
    alignItems: "center",
  },

  cancelText: {
    color: "#117C72",
    fontWeight: "700",
    fontSize: 16,
  },
});