import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../screens/firebaseConfig";

const CACHE_KEY = "cc:colleges";

export function useColleges() {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached && mounted) {
          setColleges(JSON.parse(cached));
          setLoading(false);
        }
      } catch {}
      try {
        const snap = await getDocs(collection(db, "colleges"));
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        if (mounted) setColleges(items);
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(items));
      } catch (error) {
        console.warn("Could not load colleges.", error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return { colleges, loading };
}