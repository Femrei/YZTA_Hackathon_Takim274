import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  getDocs
} from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { CheckCircle, Users } from "lucide-react";

interface JobPost {
  id: string;
  title: string;
  description: string;
  salary: string;
  location: string;
  type: string;
  applicationCount?: number;
  applicants?: any[];
}

export function IsIlanlari() {
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [salary, setSalary] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");

  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  
  const fetchJobs = async () => {
    if (!user?.companyId) return;

    const q = query(
      collection(db, "job_posts"),
      where("companyId", "==", user.companyId)
    );

    const snap = await getDocs(q);

    const jobData = await Promise.all(
      snap.docs.map(async (docSnap) => {
        const appQ = query(
          collection(db, "job_applications"),
          where("jobId", "==", docSnap.id)
        );

        const appSnap = await getDocs(appQ);

        return {
          id: docSnap.id,
          ...docSnap.data(),
          applicationCount: appSnap.size,
          applicants: appSnap.docs.map((d) => d.data())
        };
      })
    );

    setJobs(jobData as JobPost[]);
  };

  useEffect(() => {
    fetchJobs();
  }, [user]);

  
  const handlePublish = async () => {
    if (!title || !description || !user?.companyId) return;

    await addDoc(collection(db, "job_posts"), {
      companyId: user.companyId,
      companyName: user.companyName,
      title,
      description,
      salary,
      location,
      type,
      status: "active",
      createdAt: serverTimestamp()
    });

    setTitle("");
    setDescription("");
    setSalary("");
    setLocation("");
    setType("");

    setShowSuccess(true);
    fetchJobs();

    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <DashboardLayout title="İş İlanları">

      <div className="space-y-6">

        {/* ───────── FORM (GERİ GELDİ) ───────── */}
        <div className="bg-white p-6 rounded-xl space-y-4 shadow">
          <input
            placeholder="Pozisyon adı"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border p-2 rounded"
          />

          <textarea
            placeholder="İş açıklaması"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border p-2 rounded"
          />

          <input
            placeholder="Maaş"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            className="w-full border p-2 rounded"
          />

          <input
            placeholder="Lokasyon"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full border p-2 rounded"
          />

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="">Çalışma tipi</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="office">Ofis</option>
          </select>

          <button
            onClick={handlePublish}
            className="bg-green-600 text-white px-4 py-2 rounded-xl"
          >
            İlan Yayınla
          </button>
        </div>

        {/* ───────── SUCCESS ───────── */}
        {showSuccess && (
          <div className="bg-green-100 p-4 rounded-xl flex items-center gap-2">
            <CheckCircle className="text-green-600" />
            İlan yayınlandı
          </div>
        )}

        {/* ───────── İLANLAR + BAŞVURULAR ───────── */}
        <div className="grid md:grid-cols-2 gap-4">

          {jobs.map((job) => (
            <div key={job.id} className="bg-white p-5 rounded-xl shadow">

              <h3 className="font-bold text-lg">{job.title}</h3>
              <p>{job.location}</p>
              <p>{job.salary}</p>

              <div className="flex items-center gap-2 mt-3 text-blue-600">
                <Users className="w-4 h-4" />
                <span>{job.applicationCount} Başvuru</span>
              </div>

              {/* BAŞVURANLAR */}
              <div className="mt-3">
                <h4 className="font-semibold">Başvuranlar:</h4>

                {job.applicants?.length ? (
                  job.applicants.map((a: any, i: number) => (
                    <div key={i} className="text-sm text-gray-700">
                      • {a.applicantName} ({a.applicantEmail})
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">Henüz başvuru yok</p>
                )}
              </div>

            </div>
          ))}
        </div>
      </div>

    </DashboardLayout>
  );
}