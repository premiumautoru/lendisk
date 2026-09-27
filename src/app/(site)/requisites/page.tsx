import { permanentRedirect } from "next/navigation";

// Requisites now live only in the site footer.
export default function RequisitesPage() {
  permanentRedirect("/");
}
