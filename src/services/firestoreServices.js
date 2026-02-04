import { doc,collection, getDoc,getDocs,updateDoc,addDoc,deleteDoc,query, orderBy, onSnapshot,where,limit,setDoc,serverTimestamp  } from "firebase/firestore";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

import { db,auth } from "./firebase.js";  // your firebase.js file
console.log("🔥 firestoreServices LOADED");

// Fetch user profile (only name)
export async function getUserProfile(uid) {
  if (!uid) return null;


  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data(); // { name: "...", ... }
  } else {
    return null;
  }
}
// Get all users
export const getAllUsers = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'users'));
    const users = [];
    
    snapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return users;
  } catch (error) {
    console.error('Error getting users:', error);
    throw error;
  }
};


// Update user status
export const updateUserStatus = async (userId, status) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      status: status,
      lastSeen: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating status:', error);
  }
};



// Send a message
export const sendMessage = async (userId, userName, text) => {
  try {
    await addDoc(collection(db, 'messages'), {
      userId: userId,
      userName: userName,
      text: text,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Listen to messages in real-time
export const subscribeToMessages = (callback) => {
  const q = query(
    collection(db, 'messages'),
    orderBy('timestamp', 'asc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(messages);
  });
};

// Get recent messages (for dashboard preview)
export const getRecentMessages = (callback, messageLimit = 5) => {
  const q = query(
    collection(db, 'messages'),
    orderBy('timestamp', 'desc'),
    limit(messageLimit)
  );
  
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(messages.reverse()); // Reverse to show oldest first
  });
};
// Send a private message (1-on-1)
export const sendPrivateMessage = async (fromUserId, fromUserName, toUserId, toUserName, text) => {
  try {
    // chatId will always be same for these 2 users
    const chatId = [fromUserId, toUserId].sort().join('_');

    // Reference to the chat document
    const chatRef = doc(db, "privateChats", chatId);

    // Ensure the main chat document exists
    await setDoc(chatRef, {
      participants: [fromUserId, toUserId],
      updatedAt: serverTimestamp()
    }, { merge: true });

    // Add message inside /messages subcollection
    await addDoc(collection(chatRef, "messages"), {
      fromUserId,
      fromUserName,
      toUserId,
      toUserName,
      text,
      read: false,
      timestamp: serverTimestamp()
    });

  } catch (error) {
    console.error("Error sending private message:", error);
    throw error;
  }
};
export const subscribeToPrivateMessages = (userId1, userId2, callback) => {
  const chatId = [userId1, userId2].sort().join('_');

  const messagesRef = collection(db, "privateChats", chatId, "messages");

  const q = query(messagesRef, orderBy("timestamp", "asc"));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(messages);
  });
};
//create new task
export const createTask = async (taskData) => {
  try {
    if (!auth.currentUser) {
      throw new Error("User not authenticated");
    }

    const docRef = await addDoc(collection(db, "tasks"), {
      ...taskData,
      userId: auth.currentUser.uid, // ✅ REQUIRED
      createdAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
};
// Get all tasks

export const subscribeToTasks = (callback) => {
  const q = query(
    collection(db, "tasks"),
    where("userId", "==", auth.currentUser.uid)
  );

  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(tasks);
  });
};
// Update a task
export const updateTask = async (taskId, updates) => {
  try {
    await updateDoc(doc(db, 'tasks', taskId), updates);
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

// Delete a task
export const deleteTask = async (taskId) => {
  try {
    await deleteDoc(doc(db, 'tasks', taskId));
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};
//calender
// Create calendar event
export const createEvent = async (eventData) => {
  try {
    const docRef = await addDoc(collection(db, 'events'), {
      ...eventData,
      createdAt: serverTimestamp(),
      createdBy: eventData.createdBy,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

// Get all events
export const subscribeToEvents = (callback) => {
  const q = query(
    collection(db, 'events'),
   // orderBy('date', 'asc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const events = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(events);
  });
};

// Update event
export const updateEvent = async (eventId, updates) => {
  try {
    await updateDoc(doc(db, 'events', eventId), updates);
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

// Delete event
export const deleteEvent = async (eventId) => {
  try {
    await deleteDoc(doc(db, 'events', eventId));
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};
// Create notification
export const createNotification = async (notificationData) => {
  try {
    const docRef = await addDoc(collection(db, 'notifications'), {
      ...notificationData,
      createdAt: serverTimestamp(),
      read: false,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Subscribe to user's notifications
export const subscribeToNotifications = (userId, callback) => {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
  
  );
  
  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(notifications);
  });
};

// Mark notification as read
export const markNotificationRead = async (notificationId) => {
  try {
    await updateDoc(doc(db, 'notifications', notificationId), {
      read: true
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Toggle notification read status
export const toggleNotificationRead = async (notificationId, currentStatus) => {
  try {
    await updateDoc(doc(db, 'notifications', notificationId), {
      read: !currentStatus
    });
  } catch (error) {
    console.error('Error toggling notification:', error);
    throw error;
  }
};

// Delete notification
export const deleteNotification = async (notificationId) => {
  try {
    await deleteDoc(doc(db, 'notifications', notificationId));
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// Mark all notifications as read for a user
export const markAllNotificationsRead = async (userId) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    );
    
    const snapshot = await getDocs(q);
    const updatePromises = snapshot.docs.map(doc =>
      updateDoc(doc.ref, { read: true })
    );
    
    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error marking all as read:', error);
    throw error;
  }
};

// Delete all read notifications for a user
export const deleteReadNotifications = async (userId) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', true)
    );
    
    const snapshot = await getDocs(q);
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error deleting read notifications:', error);
    throw error;
  }
};
//setting page
// Update user profile
export const updateUserProfile = async (userId, profileData) => {
  try {
    await updateDoc(doc(db, 'users', userId), profileData);
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

// Change password
export const changeUserPassword = async (currentPassword, newPassword) => {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) throw new Error('No user logged in');

    // Re-authenticate user
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // Update password
    await updatePassword(user, newPassword);
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

// Save notification preferences
export const saveNotificationPreferences = async (userId, preferences) => {
  try {
    await setDoc(doc(db, 'userPreferences', userId), {
      notifications: preferences,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Error saving preferences:', error);
    throw error;
  }
};

// Get notification preferences
export const getNotificationPreferences = async (userId) => {
  try {
    const docSnap = await getDoc(doc(db, 'userPreferences', userId));
    if (docSnap.exists()) {
      return docSnap.data().notifications || {};
    }
    return {};
  } catch (error) {
    console.error('Error getting preferences:', error);
    return {};
  }
};