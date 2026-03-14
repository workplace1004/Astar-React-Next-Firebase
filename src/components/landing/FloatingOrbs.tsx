import { motion } from "framer-motion";

const FloatingOrbs = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none " aria-hidden="true">
      {/* Large warm orb top-right */}
      <motion.div
        animate={{
          y: [0, -30, 0],
          x: [0, 15, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-primary/[0.06] via-primary/[0.03] to-transparent blur-3xl"
      />
      {/* Medium orb bottom-left */}
      <motion.div
        animate={{
          y: [0, 20, 0],
          x: [0, -10, 0],
          scale: [1, 1.08, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-primary/[0.05] via-primary/[0.02] to-transparent blur-3xl"
      />
      {/* Small accent orb */}
      <motion.div
        animate={{
          y: [0, -15, 0],
          x: [0, 20, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 5 }}
        className="absolute top-1/3 right-1/4 w-[200px] h-[200px] rounded-full bg-gradient-to-b from-primary/[0.04] to-transparent blur-2xl"
      />
    </div>
  );
};

export default FloatingOrbs;
