import Image from 'next/image'

const team = [
  {
    name: 'Alex Johnson',
    role: 'CEO',
    bio: 'Alex brings over 20 years of industry experience leading teams to success.',
    image: '/images/alex.jpg',
  },
  {
    name: 'Maria Gomez',
    role: 'Operations Manager',
    bio: 'Maria oversees day-to-day operations and ensures everything runs smoothly.',
    image: '/images/maria.jpg',
  },
  {
    name: 'James Lee',
    role: 'Technical Lead',
    bio: 'James is responsible for technical innovation and implementation.',
    image: '/images/james.jpg',
  },
  {
    name: 'Sophie Chen',
    role: 'Customer Success Manager',
    bio: 'Sophie ensures clients have the best experience and support possible.',
    image: '/images/sophie.jpg',
  },
]

export default function OurTeam() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-foreground">Our Team</h1>
        <p className="text-muted-foreground text-lg">Meet the people behind Watson Truck&apos;s success.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {team.map((member) => (
          <div
            key={member.name}
            className="rounded-lg border border-border bg-card p-5 text-center space-y-3"
          >
            <div className="flex justify-center">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-muted">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{member.name}</h3>
              <p className="text-sm text-primary font-medium">{member.role}</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
