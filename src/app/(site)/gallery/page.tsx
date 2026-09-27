import { permanentRedirect } from "next/navigation";

// The gallery was removed; old links lead to the home page.
export default function GalleryPage() {
  permanentRedirect("/");
}
