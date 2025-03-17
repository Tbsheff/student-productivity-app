import Footer from "@/components/footer";
import Hero from "@/components/hero";
import Navbar from "@/components/navbar";
import {
  ArrowUpRight,
  CheckCircle2,
  Calendar,
  BarChart,
  Brain,
  Clock,
  ListTodo,
} from "lucide-react";
import { createClient } from "../../supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      <Hero />

      {/* Features Section */}
      <section className="py-24 bg-white" id="features">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Boost Your Academic Performance
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our AI-powered platform helps students organize tasks, manage time
              effectively, and improve study habits with personalized insights.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <ListTodo className="w-6 h-6" />,
                title: "Smart Task Management",
                description:
                  "Automatically sorts tasks by due date, priority, and estimated completion time",
              },
              {
                icon: <Calendar className="w-6 h-6" />,
                title: "LMS Integration",
                description:
                  "Syncs with Canvas and Blackboard to import deadlines and exams",
              },
              {
                icon: <BarChart className="w-6 h-6" />,
                title: "Study Analytics",
                description:
                  "Tracks time spent on subjects with personalized recommendations",
              },
              {
                icon: <Brain className="w-6 h-6" />,
                title: "AI Assistant",
                description:
                  "Answers questions about assignments and schedules",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-indigo-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our platform simplifies academic life in three easy steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-indigo-600 text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Connect Your Accounts
              </h3>
              <p className="text-gray-600">
                Link your Canvas or Blackboard account to automatically import
                assignments and deadlines
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-indigo-600 text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Organize Your Tasks
              </h3>
              <p className="text-gray-600">
                Our AI sorts your tasks by priority and suggests optimal study
                times
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-indigo-600 text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Track Your Progress
              </h3>
              <p className="text-gray-600">
                Get insights on your study habits and receive personalized
                recommendations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Focus Tools Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-6">
                Focus Tools for Better Concentration
              </h2>
              <p className="text-gray-600 mb-8">
                Enhance your study sessions with our built-in focus tools
                designed to help you stay productive.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Clock className="w-6 h-6 text-indigo-600 mt-1" />
                  <div>
                    <h4 className="font-semibold">Pomodoro Timer</h4>
                    <p className="text-gray-600">
                      Optimize your study sessions with timed work and break
                      intervals
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-indigo-600 mt-1" />
                  <div>
                    <h4 className="font-semibold">Ambient Soundscapes</h4>
                    <p className="text-gray-600">
                      Choose from a variety of background sounds to enhance
                      focus
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Brain className="w-6 h-6 text-indigo-600 mt-1" />
                  <div>
                    <h4 className="font-semibold">AI Study Recommendations</h4>
                    <p className="text-gray-600">
                      Get personalized suggestions based on your study patterns
                    </p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="md:w-1/2">
              <div className="bg-gray-200 rounded-xl p-4 aspect-video flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=800&q=80"
                  alt="Student studying with focus tools"
                  className="rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-indigo-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">85%</div>
              <div className="text-indigo-100">Improved Productivity</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-indigo-100">Student Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">30%</div>
              <div className="text-indigo-100">Better Grades</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Study Habits?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of students who have improved their academic
            performance with our platform.
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Get Started Now
            <ArrowUpRight className="ml-2 w-4 h-4" />
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
