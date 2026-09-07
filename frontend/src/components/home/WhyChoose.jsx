import {
  Leaf,
  Bug,
  Sprout,
  Heart,
  Globe,
} from "lucide-react";

import "./WhyChoose.css";

function WhyChoose() {
  const reasons = [
    {
      icon: Leaf,
      title: "100% Natural",
      text: "& Unprocessed",
    },
    {
      icon: Bug,
      title: "Ethically",
      text: "Sourced",
    },
    {
      icon: Sprout,
      title: "Rich in",
      text: "Nutrients",
    },
    {
      icon: Heart,
      title: "Supports",
      text: "Local Farmers",
    },
    {
      icon: Globe,
      title: "Better for",
      text: "You & the Planet",
    },
  ];

  return (
    <section className="why-choose-section">
      <div className="why-choose-container">

        {/* Heading */}
        <div className="why-choose-header">
          <h2>Why Choose Bee Pure?</h2>

          <p>
            Small choices today make a bigger difference tomorrow.
          </p>
        </div>

        {/* Main content */}
        <div className="why-choose-grid">

          {reasons.map((reason, index) => {
            const Icon = reason.icon;

            return (
              <div
                className="why-choose-item"
                key={index}
              >
                <div className="why-choose-icon">
                  <Icon
                    size={29}
                    strokeWidth={1.8}
                  />
                </div>

                <h3>{reason.title}</h3>

                <span>{reason.text}</span>
              </div>
            );
          })}

          {/* Decorative message */}
          <div className="why-choose-message">
            <Leaf
              className="why-message-leaf"
              size={68}
              strokeWidth={1.3}
            />

            <div className="why-message-text">
              <strong>
                Small Choices
                <br />
                Make a Bigger
                <br />
                Tomorrow
              </strong>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default WhyChoose;