import Image from "next/image";

type ModuleLogoProps = {
  type: "scholarx" | "samskara";
  size?: "sm" | "md" | "lg";
  className?: string;
};

const logos = {
  scholarx: { src: "/logos/scholarx.jpg", alt: "SCHOLARX" },
  samskara: { src: "/logos/samskara.svg", alt: "Samskara — The Cultural Wing of CUSAT" },
};

export default function ModuleLogo({ type, size = "md", className = "" }: ModuleLogoProps) {
  const logo = logos[type];
  const classes = ["module-logo", "module-logo-" + size, className].filter(Boolean).join(" ");
  return (
    <div className={classes}>
      <Image src={logo.src} alt={logo.alt} fill sizes="(max-width: 700px) 96px, 128px" />
    </div>
  );
}
