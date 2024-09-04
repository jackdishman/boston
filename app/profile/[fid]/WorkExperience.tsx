import React from "react";

interface IWorkExperienceProps {
  workExperience: {
    jobTitle: string;
    employmentType: string;
    location: string;
    orgWebsite: string;
    startDate: string;
    endDate: string | null;
  }[];
}

const WorkExperience: React.FC<IWorkExperienceProps> = ({ workExperience }) => {
  if (workExperience.length === 0) {
    return null;
  }

  return (
    <div className="my-6">
      <h3 className="text-lg font-semibold">Work Experience</h3>
      {workExperience.map((experience, index) => (
        <div key={index} className="mb-4">
          <p className="font-semibold text-gray-700">{experience.jobTitle}</p>
          <p className="text-gray-500">{experience.employmentType}</p>
          <p className="text-gray-500">{experience.location}</p>
          <a
            href={experience.orgWebsite}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            {experience.orgWebsite}
          </a>
          <p className="text-gray-500">
            {new Date(experience.startDate).toLocaleDateString()} -{" "}
            {experience.endDate
              ? new Date(experience.endDate).toLocaleDateString()
              : "Present"}
          </p>
        </div>
      ))}
    </div>
  );
};

export default WorkExperience;
