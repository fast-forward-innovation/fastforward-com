import { ContactBlock } from "./ContactBlock";
import { Footer } from "./Footer";

export function FooterBlock() {
  return (
    <div className="bg-[#1e2142] radial-gradient-background">
      <ContactBlock />
      <hr className="opacity-20 w-11/12 mx-auto" />
      <Footer />
    </div>
  );
}
