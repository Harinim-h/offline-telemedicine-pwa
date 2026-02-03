import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

const test = async () => {
  const snap = await getDocs(collection(db, "users"));
  console.log(
    "Firestore users:",
    snap.docs.map((d) => d.data())
  );
};

test();
