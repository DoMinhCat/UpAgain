import { Container, Paper, Title, Anchor, Text, TextInput, PasswordInput, Checkbox, Fieldset, Stack, Button, Popover, Progress, Box, Divider } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import { PATHS } from "../../routes/paths";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RegisterRequest } from "../../api/auth";
import { showErrorNotification, showInfoNotification } from "../NotificationToast";
import { Link } from "react-router-dom";

const requirements = [
    { re: /[0-9]/, label: "Includes number" },
    { re: /[A-Z]/, label: "Includes uppercase letter" },
    { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: "Includes special character" },
];

function getStrength(password: string) {
    let multiplier = password.length > 11 ? 0 : 1;

    requirements.forEach((requirement) => {
        if (!requirement.re.test(password)) {
            multiplier += 1;
        }
    });

    return Math.max(100 - (100 / (requirements.length + 1)) * multiplier, 10);
}

function PasswordRequirement({
    meets,
    label,
}: {
    meets: boolean;
    label: string;
}) {
    return (
        <Text
            component="div"
            c={meets ? "teal" : "red"}
            style={{ display: "flex", alignItems: "center" }}
            mt={7}
            size="sm"
        >
            {meets ? <IconCheck size={14} /> : <IconX size={14} />}
            <Box ml={10}>{label}</Box>
        </Text>
    );
}

export default function RegisterForm() {
    const navigate = useNavigate();
    // password
    const [popoverOpened, setPopoverOpened] = useState(false);
    const [password, setPassword] = useState("");
    const checks = requirements.map((requirement, index) => (
        <PasswordRequirement key={index} label={requirement.label} meets={requirement.re.test(password)} />
    ));
    const strength = getStrength(password);
    const color = strength === 100 ? 'teal' : strength > 50 ? 'yellow' : 'red';
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const validatePassword = (val: string) => {
        if (!val) {
            setPasswordError("Password is required");
            return false;
        }
        if (val.length < 12) {
            setPasswordError("Password must be at least 12 characters long");
            return false;
        }
        if (val.length > 60) {
            setPasswordError("Password must be at most 60 characters long");
            return false;
        }
        if (!requirements.every((requirement) => requirement.re.test(val))) {
            setPasswordError("Password must contain at least one number, one uppercase letter, and one special character");
            return false;
        }
        setPasswordError(null);
        return true;
    };

    // confirm password
    const [ConfirmPassword, setConfirmPassword] = useState("");
    const [ConfirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
    const validateConfirmPassword = (val: string) => {
        if (!val) {
            setConfirmPasswordError("You must confirm your password");
            return false;
        } else if (val !== password) {
            setConfirmPasswordError("Passwords do not match");
            return false;
        }
        setConfirmPasswordError(null);
        return true;
    };

    // email
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const validateEmail = (val: string) => {
        const regex = /^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,4}$/;
        if (!val) {
            setEmailError("Email is required");
            return false;
        } else if (!regex.test(val)) {
            setEmailError("Invalid email format");
            return false;
        }
        setEmailError(null);
        return true;
    };

    // username
    const [Username, setUsername] = useState("");
    const [UsernameError, setUsernameError] = useState<string | null>(null);
    const validateUsername = (val: string) => {
        if (!val) {
            setUsernameError("Username is required");
            return false;
        }
        if (val.length < 4) {
            setUsernameError("Username must be at least 4 characters long");
            return false;
        }
        if (val.length > 20) {
            setUsernameError("Username must be at most 20 characters long");
            return false;
        }
        setUsernameError(null);
        return true;
    };

    // phone
    const [phone, setPhone] = useState("");
    const [phoneError, setPhoneError] = useState<string | null>(null);
    const validatePhone = (val: string) => {
        if (!val) {
            setPhoneError("Phone number is required");
            return false;
        }
        if (!val.match(/^[0-9]+$/)) {
            setPhoneError("Phone number must contain only numbers");
            return false;
        }
        if (val.length < 10) {
            setPhoneError("Phone number must be at least 10 characters long");
            return false;
        }
        if (val.length > 15) {
            setPhoneError("Phone number must be at most 15 characters long");
            return false;
        }
        setPhoneError(null);
        return true;
    };

    // TODO: Add register function
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // Prevents page reload

        if (!validateEmail(email) || !validatePassword(password) || !validateConfirmPassword(ConfirmPassword) || !validateUsername(Username) || !validatePhone(phone)) return;
        setIsLoading(true);
        try {
            // Call axios
            const role = "user";
            await RegisterRequest({ email, password, username: Username, phone, role });

            // redirect
            navigate(PATHS.GUEST.LOGIN);
            showInfoNotification("Register Success", "You have been registered successfully, log in to continue");
        } catch (error: any) {
            showErrorNotification("Register Failed", error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Container size={520} my={40}>
            <Title ta="center">Join us today!</Title>

            <Text mt="sm" ta={"center"}>
                Already have an account?{" "}
                <Anchor href={PATHS.GUEST.LOGIN}>Sign in</Anchor>
            </Text>

            <Paper
                withBorder
                shadow="sm"
                p={22}
                mt={30}
                radius="md"
                variant="primary"
            >
                <form onSubmit={handleSubmit}>
                    <Fieldset legend="Credentials" variant="unstyled">
                        <TextInput
                            label="Email"
                            placeholder="example@gmail.com"
                            radius="md"
                            error={emailError}
                            mb="md"
                            value={email}
                            onChange={(event) => {
                                const value = event.currentTarget.value;
                                setEmail(value);
                                validateEmail(value);
                            }}
                            onBlur={() => validateEmail(email)}
                            disabled={isLoading}
                            required
                        />

                        <Popover
                            opened={popoverOpened}
                            position="bottom"
                            width="target"
                            transitionProps={{ transition: "pop" }}
                        >
                            <Popover.Target>
                                <PasswordInput
                                    withAsterisk
                                    label="Password"
                                    placeholder="Your super secret"
                                    value={password}
                                    disabled={isLoading}
                                    onFocus={() => setPopoverOpened(true)}
                                    onBlur={() => setPopoverOpened(false)}
                                    onChange={(event) => {
                                        const value = event.currentTarget.value;
                                        setPassword(value);
                                        validatePassword(value);
                                    }}
                                    error={passwordError}
                                    required
                                />
                            </Popover.Target>

                            <Popover.Dropdown>
                                <Stack gap="xs">
                                    <Progress color={color} value={strength} size={5} mb="xs" />

                                    <PasswordRequirement
                                        label="Includes at least 12 characters"
                                        meets={password.length > 11}
                                    />
                                    {checks}
                                </Stack>
                            </Popover.Dropdown>
                        </Popover>

                        <PasswordInput
                            label="Confirm Password"
                            placeholder="Confirm your password"
                            value={ConfirmPassword}
                            mt="md"
                            onChange={(event) => {
                                const value = event.currentTarget.value;
                                setConfirmPassword(value);
                                validateConfirmPassword(value);
                            }}
                            disabled={isLoading}
                            error={ConfirmPasswordError}
                            required
                        />
                    </Fieldset>
                    <Divider my="md" color="gray.5" />

                    <Fieldset legend="Personal information" variant="unstyled">
                        <TextInput
                            label="Username"
                            placeholder="John Doe"
                            radius="md"
                            mb="md"
                            error={UsernameError}
                            value={Username}
                            onChange={(event) => {
                                const value = event.currentTarget.value;
                                setUsername(value);
                                validateUsername(value);
                            }}
                            onBlur={() => validateUsername(Username)}
                            disabled={isLoading}
                            required
                        />
                        <TextInput
                            label="Phone number"
                            placeholder="06 12 34 56 78"
                            radius="md"
                            mb="md"
                            error={phoneError}
                            value={phone}
                            onChange={(event) => {
                                const value = event.currentTarget.value;
                                setPhone(value);
                                validatePhone(value);
                            }}
                            onBlur={() => validatePhone(phone)}
                            disabled={isLoading}
                        />
                    </Fieldset>
                    <Checkbox
                        mt="md"
                        defaultChecked
                        label="I agree to sell my privacy"
                        color="teal"
                        required
                    />
                    <Button
                        fullWidth
                        mt="xl"
                        variant="primary"
                        type="submit"
                        disabled={isLoading}
                        loading={isLoading}
                    >
                        Register
                    </Button>
                </form>
                <Text c="dimmed" size="sm" ta="center" mt="md">
                    Are you a professional? <Link to={PATHS.GUEST.REGISTER_PRO}>Register here</Link>
                </Text>

            </Paper>
        </Container>
    );
}