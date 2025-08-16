import axios from "axios";

const API_URL = "http://localhost:5000/api/projects"; // Backend URL

export const fetchProjects = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const fetchProjectById = async (id: string) => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data;
};

function mapCategoryToBackend(inputCategory?: string): string {
  switch ((inputCategory || "").toLowerCase()) {
    case "computer vision":
    case "cv":
      return "Computer Vision";
    case "ai":
    case "ml":
    case "ai/ml":
      return "AI/ML";
    case "web":
    case "web development":
      return "Web Development";
    case "mobile":
    case "mobile app":
      return "Mobile App";
    case "data":
    case "data science":
      return "Data Science";
    default:
      return inputCategory && [
        "Computer Vision",
        "AI/ML",
        "Web Development",
        "Mobile App",
        "Data Science",
        "Other",
      ].includes(inputCategory)
        ? inputCategory
        : "Other";
  }
}

export interface SubmitProjectInput {
  title?: string;
  name?: string;
  description?: string;
  category?: string;
  author?: string;
  authorId?: string;
  demoUrl?: string;
  codeUrl?: string;
  githubUrl?: string;
  liveUrl?: string;
  tags?: string[] | string;
  technologies?: string[] | string;
  requirements?: string[] | string;
  instructions?: string;
  executable?: boolean;
  pythonPath?: string;
  // Accept any other fields but ignore them by default
  [key: string]: any;
}

export const submitProject = async (projectData: SubmitProjectInput) => {
  const title = projectData.title || projectData.name || "Untitled";
  const name = projectData.name || title;
  const author = projectData.author || projectData.postedBy || "Unknown";
  const authorId = projectData.authorId || projectData.userId || undefined;
  const category = mapCategoryToBackend(projectData.category);

  const codeUrl = projectData.codeUrl || projectData.githubUrl || projectData.codeLink || "";
  const demoUrl = projectData.demoUrl || projectData.liveUrl || "";

  const tags = Array.isArray(projectData.tags)
    ? JSON.stringify(projectData.tags)
    : typeof projectData.tags === "string"
      ? projectData.tags
      : JSON.stringify([]);

  const technologies = Array.isArray(projectData.technologies)
    ? JSON.stringify(projectData.technologies)
    : typeof projectData.technologies === "string"
      ? projectData.technologies
      : undefined; // omit if not provided

  const requirements = Array.isArray(projectData.requirements)
    ? JSON.stringify(projectData.requirements)
    : typeof projectData.requirements === "string"
      ? projectData.requirements
      : undefined; // omit if not provided

  const payload: Record<string, any> = {
    name,
    title,
    description: projectData.description || "",
    category,
    author,
    ...(authorId ? { authorId } : {}),
    ...(codeUrl ? { codeUrl } : {}),
    ...(demoUrl ? { demoUrl } : {}),
    tags,
    ...(technologies ? { technologies } : {}),
    ...(requirements ? { requirements } : {}),
    ...(typeof projectData.instructions === "string" ? { instructions: projectData.instructions } : {}),
    ...(typeof projectData.executable === "boolean" ? { executable: String(projectData.executable) } : {}),
    ...(typeof projectData.pythonPath === "string" ? { pythonPath: projectData.pythonPath } : {}),
  };

  // Send as JSON (no file upload here). Backend expects strings for arrays and will JSON.parse them.
  const res = await axios.post(API_URL, payload, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

export const fetchAllProjects = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};
