import React, { useEffect, useState } from "react";
import "../../CSS/GuildExist.css";
import GuildDontExist from "../pages/GuildDontExist.jsx";
import GuildLayoutLarge from "../pages/GuildLayoutLarge.jsx";
import { fetchUserName, getUserUid } from "../UI/InfoUser.js";
import { getFirestore, doc, getDoc } from "firebase/firestore";

export default function Guild() {
  const [userUid, setUserUid] = useState("");
  const [userGuild, setUserGuild] = useState(null);

  useEffect(() => {
    const loadUserData = async () => {
      await fetchUserName();
      const uid = getUserUid();
      setUserUid(uid);
      if (uid) {
        await checkUserGuild(uid);
      }
    };
    loadUserData();
  }, []);

  const checkUserGuild = async (uid) => {
    const db = getFirestore();
    const userDocRef = doc(db, "users", uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      if (userData.guild) {
        setUserGuild(userData.guild);
      } else {
        setUserGuild(null);
      }
    } else {
      setUserGuild(null);
    }
  };

  return (
    <div className="divGlobalGuild">
      {userGuild ? (
        <div className="divGuildContainer">
          <GuildLayoutLarge />
        </div>
      ) : (
        <GuildDontExist />
      )}
    </div>
  );
}
