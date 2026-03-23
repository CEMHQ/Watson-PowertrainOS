export default function AboutUs() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-10">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold text-foreground">About Us</h1>
        <p className="text-lg text-muted-foreground">
          Delivering excellence in truck sales, parts, and services for over 50 years.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Our Mission</h2>
        <p className="text-muted-foreground leading-relaxed">
          At Watson Truck, our mission is to provide top-quality trucks, parts, and maintenance
          services to our customers. We are committed to excellence and delivering innovative
          solutions to meet the needs of every client.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Our History</h2>
        <p className="text-muted-foreground leading-relaxed">
          Founded in 1970, Watson Truck has grown from a small parts supplier to one of the most
          trusted names in the industry. Our journey has been fueled by dedication to service and a
          passion for helping businesses grow with the right vehicles and solutions.
        </p>
      </div>
    </div>
  )
}
