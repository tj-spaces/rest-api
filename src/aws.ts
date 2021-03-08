import * as AWS from "aws-sdk";

let ecs = new AWS.ECS();
let ec2 = new AWS.EC2();

/**
 * Gets a container's external IP address for a client to connect to.
 */
export async function getEC2InstanceIP(id: string) {
  ec2.describeInstances({ InstanceIds: [id] });
}

/**
 * Returns the voice server URL to use when connecting to a space
 */
export async function getVoiceServerURL() {
  if (process.env.USE_LOCAL_VOICE === "1") {
    return "localhost:8080";
  }

  let containerARNs = await ecs
    .listContainerInstances({ cluster: "voice" })
    .promise();

  let containers = await ecs
    .describeContainerInstances({
      containerInstances: containerARNs.containerInstanceArns,
    })
    .promise();

  let instance = await ec2
    .describeInstances({
      InstanceIds: [containers.containerInstances[0].ec2InstanceId],
    })
    .promise();

  return instance.Reservations[0].Instances[0].PublicIpAddress;
}

/**
 * Returns the simulation server URL to use when connecting to a space
 */
export async function getSimulationServerURL() {
  if (process.env.USE_LOCAL_SIMULATION === "1") {
    return "localhost:7000";
  }

  let containerARNs = await ecs
    .listContainerInstances({ cluster: "simulation" })
    .promise();

  let containers = await ecs
    .describeContainerInstances({
      containerInstances: containerARNs.containerInstanceArns,
    })
    .promise();

  let instance = await ec2
    .describeInstances({
      InstanceIds: [containers.containerInstances[0].ec2InstanceId],
    })
    .promise();

  return instance.Reservations[0].Instances[0].PublicIpAddress;
}
