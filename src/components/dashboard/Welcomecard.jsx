
import {motion} from "framer-motion"
import { useEffect,useState } from "react";
import { auth } from "../../services/firebase";
import { getUserProfile } from "../../services/firestoreServices.js";


export default function WelcomeCard()
 {
      const [name, setName] = useState("");

  useEffect(() => {
    const fetchName = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const data = await getUserProfile(user.uid);
          setName(data?.name || "Friend");
        }
      } catch (err) {
        console.error("Error fetching name:", err);
        setName("Friend");
      }
    };

    fetchName();
  }, []);

   return (
    <motion.div
     initial={{ opacity: 0, y: 20 }} 
     animate={{opacity:1 ,y:0}}
     transition={{duration:0.6}}
     whileHover={{scale:1.02}}
      className="
        w-full 
        bg-white/5 
        backdrop-blur-xl 
        border border-white/10
        rounded-2xl 
        p-6 
        shadow-[0_8px_30px_rgba(0,0,0,0.35)]
        flex flex-col gap-4
        cursor-pointer
      "
    >
      {/* Title */}
      <h1 className="text-2xl font-bold text-white tracking-wide">
        Welcome back, {name}👋
      </h1>

      {/* Subtext */}
      <p className="text-md text-gray-300 leading-relaxed">
        Your Emotional-AI assistant is here to support you today.  
        Let’s check how you're feeling and make your work easier.
      </p>

      {/* Emoji & Question */}
      <div className="mt-3 flex items-center gap-3">
        <div className="text-4xl">😊</div>

        <p className="text-lg
          bg-gradient-to-r from-[#ff7014] to-[#a100ff] 
          bg-clip-text text-transparent font-medium
        ">
          How are you feeling right now?
        </p>
      
      </div>
    </motion.div>
   
  );
}
