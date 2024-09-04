import React from "react";

interface ICredentialsProps {
  credentials: {
    name: string;
    chain: string;
    source: string;
    reference: string;
  }[];
}

const Credentials: React.FC<ICredentialsProps> = ({ credentials }) => {
  if (credentials.length === 0) {
    return null;
  }

  return (
    <div className="my-6">
      <h3 className="text-lg font-semibold">Credentials</h3>
      {credentials.map((credential, index) => (
        <div key={index}>
          <p className="text-gray-700">
            {credential.name}{" "}
            <a
              href={
                (credential.chain === "base"
                  ? `https://base.easscan.org/attestation/view/`
                  : `https://easscan.org/attestation/view/`) +
                credential.reference
              }
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              {credential.source}
            </a>
          </p>
        </div>
      ))}
    </div>
  );
};

export default Credentials;
