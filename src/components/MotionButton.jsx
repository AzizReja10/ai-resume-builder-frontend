import { motion } from "motion/react";
import { Link } from "react-router-dom";

const press = {
  type: "spring",
  stiffness: 520,
  damping: 24,
  mass: 0.55,
};

export default function MotionButton({ disabled, ...props }) {
  return (
    <motion.button
      disabled={disabled}
      whileHover={disabled ? undefined : { y: -2, scale: 1.04 }}
      whileTap={disabled ? undefined : { y: 0, scale: 0.96 }}
      transition={press}
      {...props}
    />
  );
}

export const MotionLink = motion.create(Link);
