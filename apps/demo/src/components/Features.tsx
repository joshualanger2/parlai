"use client";;import { useTranslation } from "react-i18next";;export function Features() {;const { t } = useTranslation();
  const features = [
  {
    title: t("features.easy_integration"),
    description: t("features.seamlessly_integrate_our_tools_into_your_existing_workflow_with_just_a_few_simple_steps")
  },
  {
    title: t("features.powerful_analytics"),
    description: t("features.get_detailed_insights_and_metrics_to_make_data_driven_decisions_for_your_business")
  },
  {
    title: "24/7 Support",
    description: t("features.our_dedicated_support_team_is_always_here_to_help_you_succeed_with_your_projects")
  }];


  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">{t("features.features")}</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{t("features.everything_you_need_to_succeed")}

          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">{t("features.discover_the_tools_and_features_that_will_help_you_take_your_project_to_the_next_level")}

          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) =>
            <div key={feature.title} className="flex flex-col">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  {feature.title}
                </dt>
                <dd className="mt-2 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>);

}