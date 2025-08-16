import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FloatingNavbar from "../Navbar";
import Footer from "../Footer";
import Promo from "../promo";
import { useUser } from "@clerk/clerk-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem } from "../ui/select";
import { Button } from "../ui/button";

const SubmitResource: React.FC = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("");
  const [detailedDescription, setDetailedDescription] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      console.error("User is not authenticated");
      return;
    }
    setLoading(true);
    const resource = {
      title,
      description,
      link,
      category,
      author: user.fullName,
      posterImage: user.imageUrl,
      posterUsername: user.fullName,
      detailedDescription,
      tags: tags.split(",").map((tag) => tag.trim()),
    };

    try {
      const payload: any = {
        title,
        description,
        url,
        category,
        author: user.fullName,
        authorId: user.id,
        tags: JSON.stringify(tags.split(",").map((tag) => tag.trim()).filter(Boolean)),
      };

      const response = await fetch("http://localhost:5000/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        navigate("/resources");
      } else {
        console.error("Failed to submit resource");
      }
    } catch (error) {
      console.error("Error submitting resource:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black text-white min-h-screen">
      <FloatingNavbar />
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <Card className="bg-[#0c0c0c] text-white border border-gray-800 rounded-lg shadow-lg">
            <CardHeader>
              <CardTitle className="text-3xl md:text-4xl font-bold text-center mb-8">
                Submit a Resource to PerceptAI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter the title here"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full p-3 rounded-lg bg-[#1f1f1f] border border-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                {/* Brief Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Brief Description
                  </label>
                  <Textarea
                    placeholder="Enter a brief description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    className="w-full p-3 rounded-lg bg-[#1f1f1f] border border-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                {/* Detailed Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Detailed Description
                  </label>
                  <Textarea
                    placeholder="Enter a detailed description"
                    value={detailedDescription}
                    onChange={(e) => setDetailedDescription(e.target.value)}
                    required
                    className="w-full p-3 rounded-lg bg-[#1f1f1f] border border-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                {/* Link */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    URL
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter the resource URL"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                    className="w-full p-3 rounded-lg bg-[#1f1f1f] border border-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <Select onValueChange={(value: string) => setCategory(value)} required>
                    <SelectTrigger className="w-full p-3 rounded-lg bg-[#1f1f1f] border border-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-600">
                      <span>{category || "Select a category for your project"}</span>
                    </SelectTrigger>
                    <SelectContent className="bg-[#1f1f1f] border border-gray-800">
                      <SelectItem value="Tutorial" className="text-gray-400">Tutorial</SelectItem>
                      <SelectItem value="Documentation" className="text-gray-400">Documentation</SelectItem>
                      <SelectItem value="Video" className="text-gray-400">Video</SelectItem>
                      <SelectItem value="Article" className="text-gray-400">Article</SelectItem>
                      <SelectItem value="Course" className="text-gray-400">Course</SelectItem>
                      <SelectItem value="Book" className="text-gray-400">Book</SelectItem>
                      <SelectItem value="Tool" className="text-gray-400">Tool</SelectItem>
                      <SelectItem value="Other" className="text-gray-400">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tags
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter tags (comma separated)"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full p-3 rounded-lg bg-[#1f1f1f] border border-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className={`w-full p-3 rounded-lg bg-purple-800 text-white hover:bg-purple-700 transition-colors ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      <Promo />
      <Footer />
    </div>
  );
};

export default SubmitResource;