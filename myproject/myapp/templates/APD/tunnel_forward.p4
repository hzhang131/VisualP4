action myTunnel_forward(egressSpec_t port) {
    standard_metadata.egress_spec = port;
}

