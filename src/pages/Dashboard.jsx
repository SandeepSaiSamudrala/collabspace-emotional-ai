import { motion } from "framer-motion";
import DashboardContainer from "../components/dashboard/DashboardHome";
import WelcomeCard from "../components/dashboard/Welcomecard";
import QuickActions from "../components/dashboard/QuickActions";
import QuickStats from "../components/dashboard/QuickStats";
import MoodSnapshot from "../components/dashboard/MoodSnapshot";
import MoodCheckButton from "../components/dashboard/MoodCheckButton";
import MyMoodChart from "../components/dashboard/MyMoodChart";
import AIMoodInsightCard from "../components/dashboard/AIMoodInsightCard";
import TaskBoard from "../components/dashboard/TaskBoard";
import ChatPreview from "../components/dashboard/ChatPreview";
import RecentActivity from "../components/dashboard/RecentActivity";
import AISuggestionBox from "../components/dashboard/AISuggestionBox";
import { updateUserStatus } from '../services/firestoreServices';
import { useEffect } from "react";
import { auth } from "../services/firebase";

export default function Dashboard() {


  const parentStagger = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.25,
        delayChildren: 0.2,
      },
    },
  };

  const sectionVariant = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  // Inside your Dashboard component, add this useEffect:
useEffect(() => {
  const user = auth.currentUser;
  if (user) {
    // Set online
    updateUserStatus(user.uid, 'online');

    // Set offline when closing browser
    const handleBeforeUnload = () => {
      updateUserStatus(user.uid, 'offline');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }
}, []);


  return (
    <DashboardContainer>
      <motion.div
        variants={parentStagger}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-6"
      >
        {/* 1 */}
        <motion.div variants={sectionVariant}>
          <WelcomeCard />
        </motion.div>

        {/* 2 */}
        <motion.div variants={sectionVariant}>
          <QuickActions />
        </motion.div>

        {/* 3 */}
        <motion.div variants={sectionVariant}>
          <QuickStats />
        </motion.div>

        {/* 4 */}
        <motion.div
          variants={sectionVariant}
          className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-evenly p-3 gap-6 rounded-xl border border-white/10"
        >
          <div className="flex flex-col gap-4">
           <MoodSnapshot />
          
            <MoodCheckButton />
          </div>
          <MyMoodChart />
          <AIMoodInsightCard />
        </motion.div>

        {/* 5 */}
        <motion.div variants={sectionVariant}>
          <TaskBoard />
        </motion.div>

        {/* 6 */}
        <motion.div
          variants={sectionVariant}
          className="mt-6 grid grid-cols-1 md:grid-cols-2 p-3 rounded-xl gap-6 border border-white/10"
        >
          <ChatPreview />
          <RecentActivity />
        </motion.div>

        {/* 7 */}
        <motion.div variants={sectionVariant}>
          <AISuggestionBox />
        </motion.div>
      </motion.div>
    </DashboardContainer>
  );
}
