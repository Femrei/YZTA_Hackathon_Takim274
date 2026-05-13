import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  where
} from "firebase/firestore";
import { db } from "../../services/firebase";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";

interface JobPost {
  id: string;
  title: string;
  description: string;
  salary: string;
  location: string;
  type: string;
  companyName: string;
}

export function IsIlanlariMusteri() {
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const { user } = useAuth();

  // ───────────── İLANLARI ÇEK ─────────────
  useEffect(() => {
    const fetchJobs = async () => {
      const snap = await getDocs(collection(db, "job_posts"));

      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as JobPost[];

      setJobs(data);
    };

    fetchJobs();
  }, []);

  // ───────────── USER BAŞVURULARINI ÇEK (KRİTİK FIX) ─────────────
  useEffect(() => {
    const fetchApplications = async () => {
      if (!user?.id) return;

      const q = query(
        collection(db, "job_applications"),
        where("applicantId", "==", user.id)
      );

      const snap = await getDocs(q);

      const applied = snap.docs.map((doc) => doc.data().jobId);
      setAppliedJobs(applied);
    };

    fetchApplications();
  }, [user]);

  // ───────────── BAŞVUR ─────────────
  const handleApply = async (job: JobPost) => {
    if (!user) return;

    // aynı ilana tekrar başvuru engeli
    if (appliedJobs.includes(job.id)) return;

    await addDoc(collection(db, "job_applications"), {
      jobId: job.id,
      applicantId: user.id,
      applicantName: user.name,
      applicantEmail: user.email,
      companyName: job.companyName,
      status: "pending",
      createdAt: serverTimestamp()
    });

    setAppliedJobs((prev) => [...prev, job.id]);
  };

  return (
    <DashboardLayout title="İş İlanları">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jobs.map((job) => {
          const isApplied = appliedJobs.includes(job.id);

          return (
            <div key={job.id} className="bg-white p-5 rounded-xl shadow">
              <h2 className="font-bold text-lg">{job.title}</h2>
              <p className="text-gray-500">{job.companyName}</p>
              <p>{job.description}</p>
              <p>Maaş: {job.salary}</p>
              <p>Lokasyon: {job.location}</p>
              <p>Çalışma Tipi: {job.type}</p>

              <button
                disabled={isApplied}
                onClick={() => handleApply(job)}
                className={`mt-4 px-4 py-2 rounded-xl text-white ${
                  isApplied
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600"
                }`}
              >
                {isApplied ? "Başvuruldu" : "Başvur"}
              </button>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}