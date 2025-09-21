import React, { useState, useEffect } from "react";
import { IonApp, IonHeader, IonToolbar, IonTitle, IonContent, IonModal, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonButtons, IonIcon, IonChip, IonInput, IonTextarea, IonItem, IonLabel, IonGrid, IonRow, IonCol } from "@ionic/react";
import { db, storage } from "./firebase";
import { collection, addDoc, onSnapshot, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import confetti from "canvas-confetti";
import { supabase } from "./supabase";
import Auth from "./Auth";



export default function App() {
  const [session, setSession] = useState(null);
  const [entries, setEntries] = useState([]);
  const [newEntry, setNewEntry] = useState({ title: "", description: "", emoji: "✨", category: "Notes", photo: null });
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEntry, setSelectedEntry] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "sweetThings"), (snapshot) => {
      setEntries(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null); // clears session → redirects to Auth page
  };

  const addEntry = async (e) => {
    console.log("Submitting new entry…");
    e.preventDefault();
    let photoUrl = "";

    try {

      if (newEntry.photo) {
        const fileName = `${Date.now()}-${newEntry.photo.name}`;
        const { error: uploadError } = await supabase.storage
          .from("sweet-things")
          .upload(fileName, newEntry.photo);

        if (uploadError) {
          console.error("Error uploading image:", uploadError.message);
          alert("Image upload failed: " + uploadError.message);
          return;
        }


        const { data } = supabase.storage
          .from("sweet-things")
          .getPublicUrl(fileName);

        photoUrl = data.publicUrl;
        console.log("Uploaded photo URL:", photoUrl);
      }


      await addDoc(collection(db, "sweetThings"), {
        title: newEntry.title,
        description: newEntry.description,
        emoji: newEntry.emoji,
        category: newEntry.category,
        photoUrl,
        createdAt: serverTimestamp(),
        hearts: 0,
      });


      setNewEntry({
        title: "",
        description: "",
        emoji: "✨",
        category: "Notes",
        photo: null,
      });

      confetti();
    } catch (err) {
      console.error("Error adding entry:", err);
      alert("Failed to add entry: " + err.message);
    }
  };

  const addHeart = async (id, hearts) => {
    await updateDoc(doc(db, "sweetThings", id), { hearts: hearts + 1 });
  };
  const filteredEntries = entries.filter(
    (entry) =>
      entry.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  if (!session) {

    return <Auth onLogin={(user) => setSession({ user })} />;
  } else {
    return (
      <IonApp>
        {/* Header */}
        <IonHeader>
      <IonToolbar
        style={{
          "--background": "#fff",
          "--color": "#e91e63", // pink accent
        }}
      >
        <IonTitle
          className="ion-text-start"
          style={{ fontWeight: "bold", color: "#e91e63" }}
        >
          Just Sky Things
        </IonTitle>
        <IonButtons slot="end">
          <IonButton
            style={{
              "--background": "#e91e63",
              "--color": "#fff",
              borderRadius: "10px",
              marginRight: "8px",
            }}
            onClick={() => setShowModal(true)}
          >
            Add New Entry
          </IonButton>
          <IonButton
            style={{
              "--color": "#e91e63",
              border: "1px solid #e91e63",
              borderRadius: "20px",
              background: "#fff5f7",
            }}
            onClick={handleLogout}
          >
            Logout
          </IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>

        <IonContent className="ion-padding"
        style={{ "--background": "#fff5f7" }}>
          {/* Search + Filters */}
          <IonItem lines="none" className="search-bar">
            <IonInput
              placeholder="Search entries..."
              value={searchTerm}
              onIonInput={(e) => setSearchTerm(e.detail.value)}
            />
          </IonItem>


          {/* <div style={{ display: "flex", gap: "8px", margin: "16px 0" }}>
            {["Gifts", "Surprises", "Adventures", "Notes"].map((cat) => (
              <IonChip key={cat} outline color="primary" style={{ borderRadius: "20px" }}>
                {cat}
              </IonChip>
            ))}
          </div> */}

          {/* Entries Grid */}
          <IonGrid>
            <IonRow>
              {filteredEntries.map((entry) => (
                <IonCol size="12" sizeSm="6" sizeMd="4" key={entry.id}>
                  <IonCard
                    onClick={() => setSelectedEntry(entry)}
                    style={{
                      borderRadius: "16px",
                      overflow: "hidden",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      transition: "transform 0.2s ease",
                      cursor: "pointer"
                    }}
                  >
                    {/* Photo */}
                    {entry.photoUrl && (
                      <img
                        src={entry.photoUrl}
                        alt={entry.title}
                        style={{
                          width: "100%",
                          height: "180px",
                          objectFit: "cover",
                        }}
                      />
                    )}

                    {/* Text Content */}
                    <IonCardHeader
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <IonCardTitle>{entry.title}</IonCardTitle>
                        <p style={{ color: "gray", fontSize: "14px", marginTop: "4px" }}>
                          {entry.description}
                        </p>
                      </div>

                      <IonButton
                        onClick={() => addHeart(entry.id, entry.hearts)}
                        fill="clear"
                        color="danger"
                        style={{ fontSize: "18px" }}
                      >
                        ❤️ {entry.hearts}
                      </IonButton>
                    </IonCardHeader>

                  </IonCard>
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>
        </IonContent>


        {/* Modal for Adding Entry */}
        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Add Sweet Thing</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowModal(false)}>Close</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>

          <IonContent className="ion-padding">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addEntry(e);
                setShowModal(false);
              }}
            >
              <IonItem>
                <IonLabel position="stacked">Title</IonLabel>
                <IonInput
                  value={newEntry.title}
                  onIonChange={(e) =>
                    setNewEntry({ ...newEntry, title: e.detail.value })
                  }
                  required
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Description</IonLabel>
                <IonTextarea
                  value={newEntry.description}
                  onIonChange={(e) =>
                    setNewEntry({ ...newEntry, description: e.detail.value })
                  }
                  required
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Photo</IonLabel>
                <input
                  type="file"
                  onChange={(e) =>
                    setNewEntry({ ...newEntry, photo: e.target.files[0] })
                  }
                />
              </IonItem>

              <IonButton expand="block" type="submit" color="primary">
                Save Entry
              </IonButton>
            </form>
          </IonContent>
        </IonModal>
        <IonModal
          isOpen={!!selectedEntry}
          onDidDismiss={() => setSelectedEntry(null)}
          swipeToClose={true}
          presentingElement={document.querySelector('ion-app')}
        >
          <IonHeader>
            <IonToolbar>
              <IonTitle>{selectedEntry?.title}</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setSelectedEntry(null)}>Close</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>

          <IonContent className="ion-padding">
            {selectedEntry?.photoUrl && (
              <img
                src={selectedEntry.photoUrl}
                alt={selectedEntry.title}
                style={{
                  width: "100%",
                  borderRadius: "12px",
                  marginBottom: "16px",
                }}
              />
            )}
            <h2>{selectedEntry?.title}</h2>
            <p style={{ fontSize: "16px", color: "gray" }}>
              {selectedEntry?.description}
            </p>
            <IonButton
              color="danger"
              onClick={() => addHeart(selectedEntry.id, selectedEntry.hearts)}
            >
              ❤️ {selectedEntry?.hearts}
            </IonButton>
          </IonContent>
        </IonModal>


      </IonApp>
    );
    // return <Dashboard session={session} />;
  }
}
