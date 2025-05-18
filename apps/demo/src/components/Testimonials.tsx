"use client";;import { useTranslation } from "react-i18next";;export function Testimonials() {;const { t } = useTranslation();
  const testimonials = [
  {
    quote: t("testimonials.this_platform_has_completely_transformed_how_we_handle_our_projects_the_efficiency_gains_are_incredible"),
    author: t("testimonials.sarah_johnson"),
    role: t("testimonials.cto_at_techcorp")
  },
  {
    quote: t("testimonials.the_best_investment_we_ve_made_for_our_development_team_the_support_is_outstanding"),
    author: t("testimonials.michael_chen"),
    role: t("testimonials.lead_developer_at_startupx")
  },
  {
    quote: "We've seen a 50% increase in productivity since implementing these tools.",
    author: t("testimonials.emily_rodriguez"),
    role: t("testimonials.product_manager_at_innovateco")
  }];


  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-lg font-semibold leading-8 tracking-tight text-indigo-600">{t("testimonials.testimonials")}</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{t("testimonials.trusted_by_developers_worldwide")}

          </p>
        </div>
        <div className="mx-auto mt-16 flow-root max-w-2xl sm:mt-20 lg:mx-0 lg:max-w-none">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) =>
            <div key={testimonial.author} className="rounded-2xl bg-gray-50 p-8">
                <blockquote className="text-gray-600">{t("testimonials.")}
                {testimonial.quote}{t("testimonials.")}
              </blockquote>
                <div className="mt-6">
                  <p className="font-semibold text-gray-900">{testimonial.author}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>);

}