import Link from 'next/link';
import {
  Truck,
  Sparkles,
  HardHat,
  Trash2,
  ArrowRight,
  Phone,
  MapPin,
  Mail,
  Clock,
  CheckCircle2,
  Users,
  Award,
  ShieldCheck,
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const services = [
  {
    icon: Truck,
    title: 'Moving & Transport',
    description:
      'Professional moving services for homes and offices. Careful handling, punctual delivery, and full insurance coverage.',
    image:
      'https://images.pexels.com/photos/7464393/pexels-photo-7464393.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    features: ['Packing & unpacking', 'Furniture disassembly', 'Storage solutions'],
  },
  {
    icon: Sparkles,
    title: 'Cleaning Services',
    description:
      'Deep cleaning for homes, offices, and post-construction. Eco-friendly products and trained professionals.',
    image:
      'https://images.pexels.com/photos/6195274/pexels-photo-6195274.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    features: ['Deep cleaning', 'Post-renovation', 'Regular maintenance'],
  },
  {
    icon: HardHat,
    title: 'Construction',
    description:
      'Renovation, repairs, and construction work. From small fixes to full-scale projects with skilled craftsmen.',
    image:
      'https://images.pexels.com/photos/8961260/pexels-photo-8961260.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    features: ['Renovations', 'Repairs', 'Project management'],
  },
  {
    icon: Trash2,
    title: 'Garbage Collection',
    description:
      'Reliable waste collection and disposal services. Scheduled pickups and bulk clearance for any property.',
    image:
      'https://images.pexels.com/photos/32679841/pexels-photo-32679841.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    features: ['Scheduled pickups', 'Bulk clearance', 'Recycling'],
  },
];

const stats = [
  { icon: Users, value: '50+', label: 'Team Members' },
  { icon: CheckCircle2, value: '2,000+', label: 'Jobs Completed' },
  { icon: Award, value: '8', label: 'Years of Service' },
  { icon: ShieldCheck, value: '100%', label: 'Insured & Licensed' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container-px mx-auto flex h-16 max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Truck className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">AS-Teamet</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="#services" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Services
            </Link>
            <Link href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <Link href="#contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/login">
                Get Started
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="container-px relative mx-auto max-w-7xl py-16 sm:py-24 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="animate-fade-up space-y-6">
              <Badge variant="secondary" className="w-fit gap-1.5 py-1.5">
                <span className="flex h-2 w-2 rounded-full bg-primary" />
                Trusted across Denmark since 2018
              </Badge>
              <h1 className="text-4xl font-bold leading-tight tracking-tight text-balance sm:text-5xl lg:text-6xl">
                Professional services for your home and business
              </h1>
              <p className="max-w-lg text-lg text-muted-foreground text-balance">
                From moving and cleaning to construction and waste collection, AS-Teamet delivers reliable, high-quality work across Denmark. One team, every job done right.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="#contact">
                    Request a Service
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="#services">Explore Services</Link>
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-primary" /> Free quotes
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-primary" /> Fully insured
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-primary" /> Same-day available
                </span>
              </div>
            </div>
            <div className="animate-fade-in relative">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <img
                  src="https://images.pexels.com/photos/7464722/pexels-photo-7464722.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                  alt="Professional mover carrying furniture"
                  className="h-[300px] w-full object-cover sm:h-[400px] lg:h-[500px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
              <div className="absolute -bottom-4 -left-4 hidden rounded-xl border bg-card p-4 shadow-lg sm:block">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">24/7 Availability</p>
                    <p className="text-xs text-muted-foreground">Emergency services</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-secondary/30">
        <div className="container-px mx-auto max-w-7xl py-10">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="container-px mx-auto max-w-7xl py-16 sm:py-24">
        <div className="mb-12 text-center">
          <Badge variant="secondary" className="mb-3">Our Services</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-balance">
            Everything you need, one trusted team
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground text-balance">
            We offer a full range of services to keep your home and business running smoothly. Whatever the job, we have a team for it.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <Card key={service.title} className="group overflow-hidden border-border/60 transition-all hover:shadow-lg hover:-translate-y-1 duration-300">
              <div className="relative h-44 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 flex items-center gap-2 text-white">
                  <service.icon className="h-5 w-5" />
                  <span className="text-sm font-semibold">{service.title}</span>
                </div>
              </div>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">{service.description}</p>
                <ul className="mt-4 space-y-1.5">
                  {service.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* About */}
      <section id="about" className="border-y bg-secondary/30">
        <div className="container-px mx-auto max-w-7xl py-16 sm:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-5">
              <Badge variant="secondary" className="w-fit">About Us</Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-balance">
                A Danish team built on trust and hard work
              </h2>
              <p className="text-muted-foreground text-balance">
                AS-Teamet was founded with a simple mission: to provide dependable, professional services that make life easier for our clients. Our trained teams handle every job with care, precision, and respect for your property.
              </p>
              <p className="text-muted-foreground text-balance">
                From a single moving job to ongoing cleaning contracts and construction projects, we bring the same level of commitment to every task. Based in Copenhagen, we serve clients across Denmark.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild>
                  <Link href="#contact">Get in Touch</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/login">Employee Login</Link>
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="overflow-hidden rounded-xl">
                  <img
                    src="https://images.pexels.com/photos/7464232/pexels-photo-7464232.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                    alt="Movers carrying boxes"
                    className="h-48 w-full object-cover"
                  />
                </div>
                <div className="overflow-hidden rounded-xl">
                  <img
                    src="https://images.pexels.com/photos/3769711/pexels-photo-3769711.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                    alt="Cleaning professional"
                    className="h-32 w-full object-cover"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="overflow-hidden rounded-xl">
                  <img
                    src="https://images.pexels.com/photos/32826199/pexels-photo-32826199.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                    alt="Construction workers"
                    className="h-32 w-full object-cover"
                  />
                </div>
                <div className="overflow-hidden rounded-xl">
                  <img
                    src="https://images.pexels.com/photos/32679841/pexels-photo-32679841.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                    alt="Waste collection"
                    className="h-48 w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="container-px mx-auto max-w-7xl py-16 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-3">Contact Us</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-balance">
            Ready to get started?
          </h2>
          <p className="mt-3 text-muted-foreground text-balance">
            Reach out for a free quote. We respond within 24 hours.
          </p>
        </div>
        <div className="mx-auto mt-10 grid max-w-4xl gap-6 sm:grid-cols-3">
          <Card className="text-center">
            <CardContent className="flex flex-col items-center gap-2 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <p className="font-semibold">Call Us</p>
              <p className="text-sm text-muted-foreground">+45 12 34 56 78</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="flex flex-col items-center gap-2 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <p className="font-semibold">Email Us</p>
              <p className="text-sm text-muted-foreground">info@as-teamet.dk</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="flex flex-col items-center gap-2 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <p className="font-semibold">Visit Us</p>
              <p className="text-sm text-muted-foreground">Hovedgaden 1, 1000 København</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-secondary/30">
        <div className="container-px mx-auto max-w-7xl py-10">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Truck className="h-4 w-4" />
              </div>
              <span className="font-bold">AS-Teamet</span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} AS-Teamet. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link href="/login" className="hover:text-foreground transition-colors">Employee Login</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
