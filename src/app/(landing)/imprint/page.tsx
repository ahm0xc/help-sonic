import Footer from "../_components/footer";
import Header from "../_components/header";

export default function ImprintPage() {
  return (
    <div>
      <Header />
      <main className="prose prose-sm lg:prose-base mx-auto py-24 max-w-3xl min-h-dvh">
        <h2>Imprint</h2>
        <p>NBC Ukraine LLC</p>
        <p>
          St. Pershotravneva 75,
          <br />
          urban settlement Voronovitsa,
          <br />
          Vinnytsya district,
          <br />
          Ukraine 23252
        </p>
        <p>Sources for the images and graphics used:</p>
        <p>own, www.pexels.com, unsplash.com</p>
      </main>
      <Footer />
    </div>
  );
}
