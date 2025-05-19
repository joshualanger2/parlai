export function Testimonials() {
  const testimonials = [
    {
      quote: "This platform has completely transformed how we handle our projects. The efficiency gains are incredible!",
      author: "Sarah Johnson",
      role: "CTO at TechCorp",
    },
    {
      quote: "The best investment we've made for our development team. The support is outstanding.",
      author: "Michael Chen",
      role: "Lead Developer at StartupX",
    },
    {
      quote: "We've seen a 50% increase in productivity since implementing these tools.",
      author: "Emily Rodriguez",
      role: "Product Manager at InnovateCo",
    },
  ];

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-lg font-semibold leading-8 tracking-tight text-indigo-600">Testimonials</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Trusted by developers worldwide
          </p>
        </div>
        <div className="mx-auto mt-16 flow-root max-w-2xl sm:mt-20 lg:mx-0 lg:max-w-none">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div key={testimonial.author} className="rounded-2xl bg-gray-50 p-8">
                <blockquote className="text-gray-600">
                  "{testimonial.quote}"
                </blockquote>
                <div className="mt-6">
                  <p className="font-semibold text-gray-900">{testimonial.author}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}