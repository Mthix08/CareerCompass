import { doc, getDoc } from "firebase/firestore";
import { db } from "../screens/firebaseConfig";

export const getProspectus = async (universityId) => {
  try {
    const prospectusRef = doc(
      db,
      "prospectuses",
      universityId
    );

    const prospectusSnapshot = await getDoc(prospectusRef);

    if (!prospectusSnapshot.exists()) {
      return null;
    }

    return prospectusSnapshot.data();
  } catch (error) {
    console.error("Failed to retrieve prospectus:", error);
    throw error;
  }
};
