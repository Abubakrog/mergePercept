import { useEffect, useState } from "react";
import FloatingNavbar from "@/components/Navbar";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Footer from "@/components/Footer";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:5000"; // Backend URL
const FALLBACK_IMAGE_URL = "./logo.jpg"; // Fallback image URL

interface Project {
    name: string;
    image: string | null;
    description: string;
}

const VisionProjects = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                // Prefer dynamic scan of CV folder
                const response = await fetch(`${API_URL}/opencv/projects`);
                const data = await response.json();

                if (data.projects) {
                    setProjects(data.projects);
                } else {
                    setError("No projects found");
                }
            } catch (err) {
                setError("Failed to fetch projects");
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    const handleRunProject = async (projectName: string) => {
        try {
            const response = await fetch(`${API_URL}/run/${projectName}`, { method: 'POST' });
            const data = await response.json();
            toast.success(data.message || data.error);
        } catch (error) {
            toast.error("Failed to start the project.");
        }
    };

    return (
        <div className="bg-black text-white min-h-screen">
                            <FloatingNavbar />

            <div className="max-w-7xl mx-auto px-4 py-12 pt-[10rem]">
                <h2 className="text-3xl font-bold mb-6 text-white text-center">
                    PerceptAI Vision Directory
                </h2>

                {/* Submit Button */}
                <div className="flex justify-end mb-6">
                    <Link to="/opencv/submit">
                        <Button variant="outline" className="text-black text-sm px-4 py-2">
                            Submit Yours
                        </Button>
                    </Link>
                </div>

                {/* Loading & Error Handling */}
                {loading ? (
                    <p className="text-white text-center">Loading projects...</p>
                ) : error ? (
                    <p className="text-red-500 text-center">{error}</p>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {projects.map((project, index) => (
                        <div key={index} className="h-[360px]">
                          <Card className="relative h-full bg-[#1a1a1a] text-white border border-gray-700 rounded-lg overflow-hidden shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
                            <img
                              src={project.image ? `${API_URL}${project.image}` : FALLBACK_IMAGE_URL}
                              alt={project.name}
                              className="w-full h-40 object-cover"
                            />
                            <CardHeader className="p-4">
                              <CardTitle className="text-lg font-semibold line-clamp-1">{project.name}</CardTitle>
                              <CardDescription className="text-gray-400 text-sm line-clamp-3 min-h-[60px]">
                                {project.description || 'No description provided.'}
                              </CardDescription>
                              <div className="grid grid-cols-2 gap-2 mt-3">
                                <button 
                                  onClick={() => handleRunProject(project.name)}
                                  className="w-full py-1 text-xs rounded-md text-white border hover:bg-white/20 transition-all duration-300"
                                >
                                  Run 🚀
                                </button>
                                <button 
                                  onClick={async () => {
                                    try {
                                      const resp = await fetch(`${API_URL}/stop/${project.name}`, { method: 'POST' });
                                      const data = await resp.json();
                                      if (resp.ok) toast.success(data.message); else toast.error(data.error);
                                    } catch {
                                      toast.error('Failed to stop project');
                                    }
                                  }}
                                  className="w-full py-1 text-xs rounded-md text-white border hover:bg-white/20 transition-all duration-300"
                                >
                                  Stop ✖
                                </button>
                              </div>
                            </CardHeader>
                          </Card>
                        </div>
                      ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default VisionProjects;
