import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Mail, PenSquare } from "lucide-react";
import api from "../api/axios";
import Avatar from "../components/Avatar";
import EmptyState from "../components/EmptyState";
import PostCard, { PostCardSkeleton } from "../components/PostCard";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { formatDate } from "../utils/formatDate";
import { getErrorMessage } from "../utils/error";

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingPostId, setDeletingPostId] = useState(null);
  const toast = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [nameField, setNameField] = useState(user?.name || "");
  const [avatarField, setAvatarField] = useState(user?.avatar || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNameField(user?.name || "");
    setAvatarField(user?.avatar || "");
  }, [user]);

  useEffect(() => {
    const controller = new AbortController();

    const loadMyPosts = async () => {
      setLoading(true);

      try {
        const { data } = await api.get("/posts", {
          signal: controller.signal,
          params: { author: "me", limit: 50 }
        });

        setPosts(data.posts);
      } catch (error) {
        if (error.name !== "CanceledError") {
          toast.error(getErrorMessage(error, "Could not load your posts"));
        }
      } finally {
        setLoading(false);
      }
    };

    loadMyPosts();
    return () => controller.abort();
  }, [toast]);

  const handleDelete = async (postId) => {
    if (deletingPostId) {
      return;
    }

    const confirmed = window.confirm("Delete this post and its comments?");

    if (!confirmed) {
      return;
    }

    setDeletingPostId(postId);

    try {
      await api.delete(`/posts/${postId}`);
      setPosts((current) => current.filter((post) => post._id !== postId));
      toast.success("Post deleted");
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not delete post"));
    } finally {
      setDeletingPostId(null);
    }
  };

  const [uploading, setUploading] = useState(false);

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const form = new FormData();
    form.append("avatar", file);

    setUploading(true);

    try {
      const { data } = await api.post("/auth/me/avatar", form, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setAvatarField(data.url);
      // refresh global user so header and other UI update
      try {
        await refreshUser();
      } catch (err) {
        // ignore refresh errors
      }

      toast.success("Avatar uploaded");
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not upload avatar"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <section>
      <div className="grid gap-5 rounded-lg border border-slate-200 bg-white p-6 shadow-soft md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
        <Avatar user={{ ...user, name: nameField, avatar: avatarField }} size="lg" />
        <div className="min-w-0">
          {!isEditing ? (
            <>
              <h1 className="truncate text-2xl font-bold text-slate-950">{user.name}</h1>
              <p className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-600">
                <Mail className="h-4 w-4" aria-hidden="true" />
                <span className="truncate">{user.email}</span>
              </p>
              <p className="mt-1 text-sm text-slate-500">Joined {formatDate(user.createdAt)}</p>
            </>
          ) : (
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Name</label>
                <input
                  value={nameField}
                  onChange={(e) => setNameField(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Avatar</label>
                <div className="mt-1 flex items-center gap-3">
                  <Avatar user={{ name: nameField, avatar: avatarField }} size="md" />
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileChange}
                      className="mt-1 block text-sm text-slate-600"
                    />
                    {uploading ? <p className="text-sm text-slate-500">Uploading...</p> : null}
                    {avatarField ? (
                      <p className="text-sm text-slate-500 truncate max-w-xs">{avatarField}</p>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    if (!nameField || nameField.trim().length < 2) {
                      toast.error("Name must be at least 2 characters");
                      return;
                    }

                    setSaving(true);

                    try {
                      await api.put("/auth/me", { name: nameField, avatar: avatarField });
                      await refreshUser();
                      toast.success("Profile updated");
                      setIsEditing(false);
                    } catch (error) {
                      toast.error(getErrorMessage(error, "Could not update profile"));
                    } finally {
                      setSaving(false);
                    }
                  }}
                  disabled={saving}
                  className="btn-ombre inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setNameField(user?.name || "");
                    setAvatarField(user?.avatar || "");
                  }}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium"
            >
              Edit profile
            </button>
          ) : null}

          <Link
            to="/create-post"
            className="btn-ombre inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold"
          >
            <PenSquare className="h-4 w-4" aria-hidden="true" />
            New post
          </Link>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-950">My posts</h2>
          <p className="mt-1 text-sm text-slate-600">{posts.length} published articles</p>
        </div>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 3 }, (_, index) => <PostCardSkeleton key={index} />)
          : posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                canManage
                deleting={deletingPostId === post._id}
                onDelete={handleDelete}
              />
            ))}
      </div>

      {!loading && posts.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            title="No posts yet"
            description="Create your first article and it will appear here."
            action={
              <Link
                to="/create-post"
                className="btn-ombre inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold"
              >
                <PenSquare className="h-4 w-4" aria-hidden="true" />
                Create post
              </Link>
            }
          />
        </div>
      ) : null}
    </section>
  );
};

export default Profile;
