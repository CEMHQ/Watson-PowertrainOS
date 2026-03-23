export default function ContactUs() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-foreground">Get in Touch</h2>
            <p className="text-muted-foreground">
              We are here to help! Feel free to reach out through the form below or visit us at our location.
            </p>
          </div>

          <form className="space-y-4" action="#" method="POST">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First Name"
                required
                className="border border-border rounded-md px-3 py-2 w-full bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="text"
                placeholder="Last Name"
                required
                className="border border-border rounded-md px-3 py-2 w-full bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <input
              type="email"
              placeholder="Email"
              required
              className="border border-border rounded-md px-3 py-2 w-full bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="text"
              placeholder="Phone Number"
              className="border border-border rounded-md px-3 py-2 w-full bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="text"
              placeholder="Subject"
              required
              className="border border-border rounded-md px-3 py-2 w-full bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <textarea
              rows={4}
              placeholder="Please leave your comment here!"
              required
              className="border border-border rounded-md px-3 py-2 w-full bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90 transition-colors font-medium"
            >
              Submit
            </button>
          </form>
        </div>

        <div className="rounded-lg overflow-hidden border border-border">
          <iframe
            width="100%"
            height="100%"
            style={{ minHeight: '400px' }}
            src="https://maps.google.com/maps?q=1501%20n%20grimes%20hobbs%20new%20mexico&t=&z=13&ie=UTF8&iwloc=&output=embed"
            frameBorder={0}
            scrolling="no"
            allowFullScreen
            title="Watson Truck & Supply location"
          />
        </div>
      </div>
    </div>
  )
}
